import Constants from 'expo-constants';
import type { ComponentType } from 'react';
import type { Detection, Language } from '@/ml/types';

export type RealPipelineProps = {
  language: Language;
  onDetections: (detections: Detection[]) => void;
  onSwitchToDemo: () => void;
};

/**
 * Lazily load the real camera pipeline. We must NOT import VisionCamera in
 * Expo Go (the native module is missing and importing it throws), so this
 * guarded require keeps demo mode working everywhere.
 */
export function getRealPipeline(): ComponentType<RealPipelineProps> | null {
  if (Constants.executionEnvironment === 'storeClient') {
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('./RealPipeline') as { RealPipeline?: ComponentType<RealPipelineProps> };
    return mod.RealPipeline ?? null;
  } catch {
    return null;
  }
}
