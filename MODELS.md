# Models — download, export and train

SafeStep uses **one active model in v6**:

| File | Classes | Purpose |
| --- | --- | --- |
| `yolo_coco.tflite` | 80 COCO classes | people, vehicles, animals, furniture |
| `yolo_hazards.tflite` | 3 custom classes (v7) | wall, stairs, door (gate maps to door) |

The COCO model is bundled and active. `yolo_hazards.tflite` is a placeholder and is
not loaded in v6. Camera mode runs COCO detections only, filtered to the precision
allowlist in `src/ml/labels.ts`.

## Model contract

Both models must match this contract (the code in `src/ml/yolo.ts` depends on it):

- Input: `float32`, RGB, values normalized to `0.0–1.0` (the resizer already
  outputs normalized float32 RGB). Both `[1, H, W, 3]` (NHWC) and
  `[1, 3, H, W]` (NCHW) layouts are detected automatically from the model.
- Output: `float32`, shape `[1, 4 + numClasses, anchors]` (Ultralytics default,
  e.g. `[1, 84, 2100]` for COCO and `[1, 7, 2100]` for the 3-class v7 hazard model).
- Box format: `cx, cy, w, h`, either **normalized 0–1** (common in newer
  Ultralytics TFLite exports) or in **input pixels** (0–320). The decoder
  detects which layout the model uses from the box rows.
- Class scores must already be sigmoid-activated (0–1).
- Class order must match `src/ml/labels.ts`:
  - COCO: the standard 80-class Ultralytics order.
  - v7 hazards: **wall, stairs, door** (`gate` is announced as `door`).

The input size and layout are read from the COCO model at runtime, so both models
must use the same input configuration. `MODEL.inputSize` in `src/config.ts` is only
a fallback for when the model shape cannot be read.

---

## Option A — Pretrained COCO model (fastest)

1. On your laptop, create a Python env and install Ultralytics:

   ```bash
   python -m venv .venv
   .venv\Scripts\activate        # Windows
   pip install ultralytics
   ```

2. Export YOLO11n to TFLite at 320 px:

   ```python
   from ultralytics import YOLO

   model = YOLO("yolo11n.pt")            # downloads automatically
   model.export(format="tflite", imgsz=320, half=False)
   # -> yolo11n_saved_model/yolo11n_float32.tflite
   ```

3. Rename/copy the float32 file to `assets/models/yolo_coco.tflite`.

4. Verify the shapes in Python:

   ```python
   import tensorflow as tf
   interpreter = tf.lite.Interpreter(model_path="assets/models/yolo_coco.tflite")
   interpreter.allocate_tensors()
   print(interpreter.get_input_details()[0]["shape"])   # [1 320 320 3]
   print(interpreter.get_output_details()[0]["shape"])  # [1 84 2100]
   ```

If your export gives `[1, 2100, 84]` instead, you exported a transposed head.
Use `model.export(format="tflite", imgsz=320)` from a recent Ultralytics version,
or adapt `decodeYolo` to the transposed layout.

---

## Option B — Train the v7 hazard model (deferred)

v6 deliberately ships **COCO-only** for precision. The next model should detect
three classes so it can cover walls, stairs and gate/door openings:

| ID | Class | Notes |
| --- | --- | --- |
| 0 | `wall` | walls, pillars, large barriers |
| 1 | `stairs` | steps up/down, platform edges |
| 2 | `door` | doors and gates (announced as door/gate) |

### 1. Collect images

Aim for **300–600 images per class**. Capture walls, stairs and doors/gates from
standing height, indoors and outdoors, near (1–3 m) and far (5–20 m). Include blur,
shadows, low light and partial views.

### 2. Label the images (Roboflow or Label Studio)

1. Create a free [Roboflow](https://roboflow.com) object-detection project.
2. Upload the images.
3. Draw boxes with exactly these class names and order: `wall`, `stairs`, `door`.
4. Split ~80% train / 20% validation.
5. Export in **YOLOv8** format (works for YOLO11 too). Download the ZIP.

### 3. Train on Colab

Open a new Colab notebook, set **Runtime → Change runtime type → T4 GPU**, then:

```python
!pip install ultralytics

from google.colab import files
uploaded = files.upload()          # upload the Roboflow ZIP
!unzip -q dataset.zip -d dataset
```

Create `data.yaml` (check the folder name Roboflow used):

```python
import yaml

data = {
    "path": "/content/dataset",
    "train": "train/images",
    "val": "valid/images",
    "names": {
        0: "wall",
        1: "stairs",
        2: "door",
    },
}
with open("data.yaml", "w") as f:
    yaml.dump(data, f)
```

Train:

```python
from ultralytics import YOLO

model = YOLO("yolo11n.pt")
model.train(
    data="data.yaml",
    epochs=80,
    imgsz=320,
    batch=16,
    patience=20,
    name="hazards_v7",
)
```

### 4. Export to TFLite

```python
best = YOLO("runs/detect/hazards_v7/weights/best.pt")
best.export(format="tflite", imgsz=320, half=False)
```

Download `best_saved_model/best_float32.tflite` and rename it to
`assets/models/yolo_hazards.tflite`.

### 5. Verify and run

```python
import tensorflow as tf
interpreter = tf.lite.Interpreter(model_path="best_float32.tflite")
interpreter.allocate_tensors()
print(interpreter.get_input_details()[0]["shape"])   # [1 320 320 3]
print(interpreter.get_output_details()[0]["shape"])  # [1 7 2100]
```

Then, in v7:

1. Update `HAZARD_LABELS`, heights, priorities and Urdu labels in `src/ml/labels.ts`.
2. Set `HAZARD_ENABLED = true` in `src/camera/useObjectDetection.ts`.
3. Put both `.tflite` files in `assets/models/`.
4. Run `npx expo start --clear` (Metro caches assets).
5. In the app: **Settings → Camera detection → On**.

---

## Improving accuracy

- **More data beats a bigger model.** 300+ images per class, varied conditions.
- Keep `imgsz=320` for speed on 3 GB phones. Try 416 if your phone is fast.
- If hazards are missed, add more near/far shots and lower `MODEL.candidateThreshold`.
- If you get false positives, raise `MODEL.displayThreshold`/`MODEL.voiceThreshold`.
- Retrain when you add a class — the order in `src/ml/labels.ts` must match `data.yaml`.
- v7 should also move from center-crop resize to Ultralytics letterbox preprocessing
  so boxes and distances stay aligned.

## Distance calibration

Distance uses a pinhole model: `distance ≈ realHeight × focalPx / bboxHeightPx`.
`realHeight` per class lives in `src/ml/labels.ts`. Tune these in `src/config.ts`:

- `verticalFovDeg` (default 65): raise if everything reads too close.
- `cameraHeightM` (default 1.2): phone height, reserved for flat/ground hazards.
- `horizonNorm` (default 0.42): horizon line in the preview.

To calibrate: stand a known distance (e.g. 10 m) from a car, read the announced
distance, then scale `verticalFovDeg` until it matches. Distances are approximate.
