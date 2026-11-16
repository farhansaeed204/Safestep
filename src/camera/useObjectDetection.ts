import { Asset } from 'expo-asset';
import { useCallback, useEffect, useState } from 'react';
import type { Frame } from 'react-native-vision-camera';
import { useFrameOutput } from 'react-native-vision-camera';
import { loadTensorflowModel, type TfliteModel } from 'react-native-fast-tflite';
import { scheduleOnRN } from 'react-native-worklets';
import { CAMERA, MODEL } from '@/config';
import {
  COCO_FLAT_ARRAY,
  COCO_HEIGHT_ARRAY,
  HAZARD_FLAT_ARRAY,
  HAZARD_HEIGHT_ARRAY,
} from '@/ml/labels';
import type { Detection } from '@/ml/types';
import { buildDetections, decodeYolo } from '@/ml/yolo';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const COCO_MODEL = require('../../assets/models/yolo_coco.tflite');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const HAZARD_MODEL = require('../../assets/models/yolo_hazards.tflite');

// The hazard model is still a placeholder - skip loading it until a real
// export is dropped into `assets/models/yolo_hazards.tflite`.
const HAZARD_ENABLED = false;
const ASSET_TIMEOUT_MS = 15000;
const MODEL_TIMEOUT_MS = 30000;
const CPU_FRAME_WIDTH = 640;
const CPU_FRAME_HEIGHT = 360;

type ModelState = {
  model?: TfliteModel;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
  assetUri?: string;
  localUri?: string;
};

type ResolvedModel = {
  url: string;
  assetUri: string;
  localUri?: string;
};

export type ObjectDetectionStatus = 'disabled' | 'loading' | 'ready' | 'error';

export type ObjectDetectionDiagnostics = {
  modelStatus: ModelState['status'];
  modelError?: string;
  cpuFallback: boolean;
  inputSize: number;
  pixelLayout: 'interleaved' | 'planar';
  assetUri?: string;
  assetLocalUri?: string;
  runtimeError?: string;
};

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(message));
    }, ms);
    promise.then(
      (value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function loadModelWithTimeout(url: string, ms: number): Promise<TfliteModel> {
  return new Promise<TfliteModel>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error('Timed out loading the TFLite model'));
    }, ms);
    loadTensorflowModel({ url }, []).then(
      (model) => {
        if (settled) {
          model.dispose();
          return;
        }
        settled = true;
        clearTimeout(timer);
        resolve(model);
      },
      (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function normalizeAndroidAssetUri(uri: string): string {
  if (uri.startsWith('file:///android_asset/')) {
    const fileName = uri.substring(uri.lastIndexOf('/') + 1);
    return `file:///android_res/raw/${fileName}`;
  }
  return uri;
}

async function resolveModelUrl(source: number): Promise<ResolvedModel> {
  const asset = Asset.fromModule(source);
  const assetUri = asset.uri;
  const candidate = asset.localUri ?? asset.uri;
  const normalized = normalizeAndroidAssetUri(candidate);
  const isAndroidResource =
    normalized.startsWith('file:///android_res/') ||
    normalized.startsWith('file:///android_asset/');

  if (!isAndroidResource && normalized.startsWith('file:///')) {
    return { url: normalized, assetUri, localUri: normalized };
  }

  const copy = new Asset({
    name: asset.name,
    type: asset.type || 'tflite',
    hash: asset.hash,
    uri: normalized,
  });
  const copied = await copy.downloadAsync();
  const localUri = copied.localUri ?? copied.uri;
  if (!localUri.startsWith('file:///')) {
    throw new Error(`Model asset did not resolve to a local file: ${localUri}`);
  }
  return { url: localUri, assetUri, localUri };
}

function useTfliteModel(source: number, enabled: boolean, retryToken: number): ModelState {
  const [model, setModel] = useState<TfliteModel | undefined>(undefined);
  const [status, setStatus] = useState<ModelState['status']>(enabled ? 'loading' : 'idle');
  const [error, setError] = useState<string | undefined>(undefined);
  const [assetUri, setAssetUri] = useState<string | undefined>(undefined);
  const [localUri, setLocalUri] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    (async () => {
      setStatus('loading');
      setError(undefined);
      try {
        const resolved = await withTimeout(
          resolveModelUrl(source),
          ASSET_TIMEOUT_MS,
          'Timed out resolving the model asset',
        );
        if (cancelled) return;
        setAssetUri(resolved.assetUri);
        setLocalUri(resolved.localUri);
        if (__DEV__) console.log('[SafeStep] loading model from', resolved.url);
        const loaded = await loadModelWithTimeout(resolved.url, MODEL_TIMEOUT_MS);
        if (!cancelled) {
          setModel(loaded);
          setStatus('ready');
        } else {
          loaded.dispose();
        }
      } catch (e) {
        if (!cancelled) {
          console.warn('[SafeStep] model load failed', e);
          setError(e instanceof Error ? e.message : String(e));
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [source, enabled, retryToken]);

  return {
    model,
    status: enabled ? status : 'idle',
    error,
    assetUri,
    localUri,
  };
}

function resizeFrameToFloat32(
  frame: Frame,
  outWidth: number,
  outHeight: number,
  pixelLayout: 'interleaved' | 'planar',
): ArrayBuffer {
  'worklet';
  if (frame.isPlanar) {
    throw new Error(`CPU pipeline needs a non-planar RGB frame, got ${frame.pixelFormat}`);
  }
  if (!frame.hasPixelBuffer) {
    throw new Error('Frame has no CPU-accessible pixel buffer');
  }

  const source = frame.getPixelBuffer();
  const srcWidth = frame.width;
  const srcHeight = frame.height;
  const bytesPerRow = frame.bytesPerRow;
  const bytesPerPixel = Math.max(1, Math.round(bytesPerRow / srcWidth));
  const bytes = new Uint8Array(source);
  const format = frame.pixelFormat;

  let redIndex = 0;
  let blueIndex = 2;
  if (format === 'rgb-bgra-8-bit') {
    redIndex = 2;
    blueIndex = 0;
  } else if (format !== 'rgb-rgba-8-bit' && format !== 'rgb-rgb-8-bit') {
    throw new Error(`Unsupported CPU pixel format: ${format}`);
  }

  const orientation = frame.orientation;
  const uprightWidth =
    orientation === 'left' || orientation === 'right' ? srcHeight : srcWidth;
  const uprightHeight =
    orientation === 'left' || orientation === 'right' ? srcWidth : srcHeight;

  const scale = Math.max(outWidth / uprightWidth, outHeight / uprightHeight);
  const cropWidth = outWidth / scale;
  const cropHeight = outHeight / scale;
  const offsetX = (uprightWidth - cropWidth) / 2;
  const offsetY = (uprightHeight - cropHeight) / 2;

  const output = new Float32Array(outWidth * outHeight * 3);
  const mirrored = frame.isMirrored;

  for (let y = 0; y < outHeight; y++) {
    const uprightY = offsetY + ((y + 0.5) * cropHeight) / outHeight;
    for (let x = 0; x < outWidth; x++) {
      let uprightX = offsetX + ((x + 0.5) * cropWidth) / outWidth;
      if (mirrored) {
        uprightX = uprightWidth - 1 - uprightX;
      }

      let sourceX: number;
      let sourceY: number;
      if (orientation === 'up') {
        sourceX = uprightX;
        sourceY = uprightY;
      } else if (orientation === 'down') {
        sourceX = uprightWidth - 1 - uprightX;
        sourceY = uprightHeight - 1 - uprightY;
      } else if (orientation === 'right') {
        sourceX = srcWidth - 1 - uprightY;
        sourceY = uprightX;
      } else {
        sourceX = uprightY;
        sourceY = srcHeight - 1 - uprightX;
      }

      const px = Math.min(srcWidth - 1, Math.max(0, Math.round(sourceX)));
      const py = Math.min(srcHeight - 1, Math.max(0, Math.round(sourceY)));
      const base = py * bytesPerRow + px * bytesPerPixel;
      const red = bytes[base + redIndex] / 255;
      const green = bytes[base + 1] / 255;
      const blue = bytes[base + blueIndex] / 255;

      if (pixelLayout === 'interleaved') {
        const index = (y * outWidth + x) * 3;
        output[index] = red;
        output[index + 1] = green;
        output[index + 2] = blue;
      } else {
        const plane = outWidth * outHeight;
        const index = y * outWidth + x;
        output[index] = red;
        output[plane + index] = green;
        output[plane * 2 + index] = blue;
      }
    }
  }

  return output.buffer as ArrayBuffer;
}

export function useObjectDetection(
  enabled: boolean,
  onDetections: (detections: Detection[]) => void,
  onFrameProcessed?: () => void,
) {
  const [modelRetryToken, setModelRetryToken] = useState(0);
  const coco = useTfliteModel(COCO_MODEL, enabled, modelRetryToken);
  const hazard = useTfliteModel(HAZARD_MODEL, enabled && HAZARD_ENABLED, modelRetryToken);

  const cocoModel = coco.model;
  const hazardModel = hazard.model;

  const cocoShape = cocoModel?.outputs?.[0]?.shape;
  const hazardShape = hazardModel?.outputs?.[0]?.shape;

  // Ultralytics exports are usually NHWC `[1,H,W,3]`, but newer LiteRT
  // exports use NCHW `[1,3,H,W]`. Detect the layout from the model itself.
  const cocoInputShape = cocoModel?.inputs?.[0]?.shape;
  const inputIsNchw =
    cocoInputShape != null &&
    cocoInputShape.length === 4 &&
    cocoInputShape[1] === 3 &&
    cocoInputShape[3] !== 3;
  const rawInputSize =
    cocoInputShape != null && cocoInputShape.length === 4
      ? inputIsNchw
        ? cocoInputShape[2]
        : cocoInputShape[1]
      : MODEL.inputSize;
  const inputSize = rawInputSize > 0 ? rawInputSize : MODEL.inputSize;
  const pixelLayout: 'interleaved' | 'planar' = inputIsNchw ? 'planar' : 'interleaved';

  const [runtimeError, setRuntimeError] = useState<string | undefined>(undefined);

  const reportRuntimeError = useCallback((message: string) => {
    setRuntimeError((previous) => previous ?? message);
  }, []);

  // YOLO output is [1, 4 + classes, anchors]. Guard against odd shapes.
  const cocoNumClasses = cocoShape?.length === 3 ? Math.max(1, cocoShape[1] - 4) : 80;
  const cocoNumAnchors = cocoShape?.length === 3 ? cocoShape[2] : 2100;
  const hazardNumClasses = hazardShape?.length === 3 ? Math.max(1, hazardShape[1] - 4) : 6;
  const hazardNumAnchors = hazardShape?.length === 3 ? hazardShape[2] : 2100;

  const onFrame = useCallback(
    (frame: Frame) => {
      'worklet';
      if (!enabled || cocoModel == null) {
        frame.dispose();
        return;
      }

      try {
        const input = resizeFrameToFloat32(frame, inputSize, inputSize, pixelLayout);
        // The resizer counter-rotates the buffer into screen/upright space.
        // Use those dimensions for box mapping and distance math, not the raw
        // landscape buffer size.
        const quarterTurn = frame.orientation === 'left' || frame.orientation === 'right';
        const uprightWidth = quarterTurn ? frame.height : frame.width;
        const uprightHeight = quarterTurn ? frame.width : frame.height;

        const cocoOutputs = cocoModel.runSync([input]);
        const rawCoco = decodeYolo(
          cocoOutputs[0],
          cocoNumClasses,
          cocoNumAnchors,
          inputSize,
          MODEL.candidateThreshold,
          MODEL.iouThreshold,
          MODEL.maxDetections,
          MODEL.classMargin,
          MODEL.classMarginMinScore,
          MODEL.crossClassIouThreshold,
        );
        const cocoDets = buildDetections(
          rawCoco,
          'coco',
          COCO_HEIGHT_ARRAY,
          COCO_FLAT_ARRAY,
          uprightWidth,
          uprightHeight,
          CAMERA.cameraHeightM,
          CAMERA.horizonNorm,
          CAMERA.verticalFovDeg,
        );

        let hazardDets: Detection[] = [];
        if (hazardModel != null) {
          const hazardOutputs = hazardModel.runSync([input]);
          const rawHazard = decodeYolo(
            hazardOutputs[0],
            hazardNumClasses,
            hazardNumAnchors,
            inputSize,
            MODEL.candidateThreshold,
            MODEL.iouThreshold,
            MODEL.maxDetections,
            MODEL.classMargin,
            MODEL.classMarginMinScore,
            MODEL.crossClassIouThreshold,
          );
          hazardDets = buildDetections(
            rawHazard,
            'hazard',
            HAZARD_HEIGHT_ARRAY,
            HAZARD_FLAT_ARRAY,
            uprightWidth,
            uprightHeight,
            CAMERA.cameraHeightM,
            CAMERA.horizonNorm,
            CAMERA.verticalFovDeg,
          );
        }

        scheduleOnRN(onDetections, cocoDets.concat(hazardDets));
        if (onFrameProcessed != null) {
          scheduleOnRN(onFrameProcessed);
        }
      } catch (error) {
        scheduleOnRN(reportRuntimeError, String(error));
      } finally {
        frame.dispose();
      }
    },
    [
      enabled,
      cocoModel,
      hazardModel,
      onDetections,
      onFrameProcessed,
      inputSize,
      pixelLayout,
      cocoNumClasses,
      cocoNumAnchors,
      hazardNumClasses,
      hazardNumAnchors,
      reportRuntimeError,
    ],
  );

  const frameOutput = useFrameOutput({
    targetResolution: { width: CPU_FRAME_WIDTH, height: CPU_FRAME_HEIGHT },
    pixelFormat: 'rgb',
    enablePreviewSizedOutputBuffers: false,
    enablePhysicalBufferRotation: false,
    onFrame,
  });

  const status: ObjectDetectionStatus = !enabled
    ? 'disabled'
    : coco.status === 'error' || runtimeError != null
      ? 'error'
      : coco.status === 'ready'
        ? 'ready'
        : 'loading';

  const diagnostics: ObjectDetectionDiagnostics = {
    modelStatus: coco.status,
    modelError: coco.error,
    cpuFallback: true,
    inputSize,
    pixelLayout,
    assetUri: coco.assetUri,
    assetLocalUri: coco.localUri,
    runtimeError,
  };

  const resetRuntimeError = useCallback(() => {
    setRuntimeError(undefined);
    if (coco.status === 'error') {
      setModelRetryToken((token) => token + 1);
    }
  }, [coco.status]);

  return {
    frameOutput,
    status,
    error: coco.error ?? runtimeError,
    diagnostics,
    resetRuntimeError,
  };
}
