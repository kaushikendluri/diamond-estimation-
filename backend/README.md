# Diamond Stone Estimation

Detects individual diamonds in a necklace/jewelry photo (CLAHE → Otsu
threshold → distance-transform watershed → per-stone classification),
then lets you drag a box over any section and get a count for just
that region.

Same detection logic as the original Colab notebook, restructured into
a normal Python project for VSCode, plus a real interactive box-draw
(no `ipympl` workarounds needed — this uses OpenCV's native window).

## Project structure

```
backend/
├── main.py                 # CLI entry point
├── api.py                  # FastAPI service — same pipeline, for the web frontend
├── requirements.txt
├── README.md
└── src/
    ├── config.py            # all tunable parameters live here
    ├── preprocessing.py      # CLAHE, blur, Otsu threshold, morphology
    ├── segmentation.py       # distance transform + watershed
    ├── classifier.py         # per-stone extraction + cut-type labeling
    ├── roi_tool.py            # interactive box selection (cv2.selectROI)
    └── visualize.py           # drawing + region-filtering helpers
```

## Setup (VSCode)

1. Open the `backend` folder in VSCode.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. In VSCode, select this venv as your Python interpreter
   (Ctrl+Shift+P → "Python: Select Interpreter").

## Usage

```bash
python main.py path/to/necklace.jpg
```

This will:
1. Run the full detection pipeline and print the total diamond count.
2. Save all measurements to `diamond_measurements.csv`.
3. Show the full image with every detected stone boxed and numbered.
4. Open a window where you **click-drag a box** over any section of
   the necklace. Press **ENTER/SPACE** to confirm, **ESC** to cancel.
5. Print the count (and cut-type breakdown) for just that region, plus
   a zoomed-in view.

### Draw multiple boxes in one run

```bash
python main.py path/to/necklace.jpg --multi-box
```

Draw as many boxes as you like — press ENTER after each one, then ESC
when you're finished. You'll get a separate count for every box.

### Skip the plots (just want the CSV + region counts printed)

```bash
python main.py path/to/necklace.jpg --no-display
```

## Running as an API (for the web frontend)

Same detection pipeline (`preprocessing` → `segmentation` →
`classifier`), exposed over HTTP instead of the CLI/matplotlib flow,
for the Next.js frontend in `../frontend`:

```bash
uvicorn api:app --reload --port 8000
```

- `GET /health` — health check
- `POST /detect` — multipart form, field name `image`; returns total
  count, per-stone measurements/confidence/cut type, and processing
  time (see `frontend/src/types/diamond.ts`'s `DetectionResult` for
  the exact shape)

Since there's no trained model behind this pipeline, `/detect`
synthesizes a confidence score per stone from how far its mean
brightness sits above the same Otsu cutoff used to threshold the
image — not a learned probability, just a proxy signal.

Set `CORS_ORIGINS` (comma-separated) to whatever origin(s) the
frontend is served from; defaults to `http://localhost:3000`.

## Tuning detection

Almost every knob is in `src/config.py`:

- **`MIN_PEAK_DISTANCE`** — lower this if two touching small stones are
  being merged into one blob; raise it if a single stone is being
  split into two.
- **`MIN_STONE_AREA` / `MAX_STONE_AREA`** — adjust to your image
  resolution and stone size. If the count is too high, raise
  `MIN_STONE_AREA` to drop noise specks. If real stones are missing,
  check they aren't being filtered out by `MAX_STONE_AREA`.
- **`BAGUETTE_ASPECT_RATIO` / `MARQUISE_ASPECT_RATIO`** — thresholds
  for cut-type classification based on the stone's long/short side
  ratio.

## Improving accuracy further

A few directions worth exploring once this is running on your real
photos:

1. **Round vs. Square/Princess cut** — aspect ratio alone can't
   distinguish these (both are ~1:1). Add a circularity check:
   `4 * pi * area / perimeter**2`, close to `1.0` = round, noticeably
   lower = square/princess. `classifier.py` already has `cnt` available
   per stone, so this is a small addition to `classify_cut`.
2. **Glare/reflection handling** — bright specular highlights on
   diamonds can split a single stone into two peaks in the distance
   transform. Consider adding an HSV-based highlight mask (very high
   V, very low S) and merging peaks that are separated only by a thin
   highlight strip.
3. **Per-image threshold tuning** — Otsu's method is a single global
   threshold; on necklaces with very uneven lighting across the frame,
   try adaptive thresholding (`cv2.adaptiveThreshold`) as an
   alternative to compare against.
4. **Validation set** — if you have a few images with manually counted
   ground truth, keep them in a `test_images/` folder and script a
   quick precision check (`detected` vs `actual`) whenever you tweak
   `config.py`, so changes don't silently regress on older photos.
