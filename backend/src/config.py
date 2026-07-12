"""
Central configuration for the diamond detection pipeline.
Tune values here instead of hunting through the code — this is the
first place to look when detection is over/under-counting on a new photo.
"""

# --- CLAHE / preprocessing ---
CLAHE_CLIP_LIMIT = 3.0
CLAHE_TILE_GRID = (8, 8)
GAUSSIAN_BLUR_KERNEL = (3, 3)

# --- Morphology ---
OPEN_KERNEL_SIZE = (2, 2)
CLOSE_KERNEL_SIZE = (2, 2)

# --- Watershed / distance transform ---
MIN_PEAK_DISTANCE = 4      # min pixel gap between two diamond centers
                           # lower -> splits smaller touching stones, but
                           # too low starts over-segmenting single stones
BG_DILATE_KERNEL = (3, 3)
BG_DILATE_ITERS = 2

# --- Contour filtering ---
MIN_STONE_AREA = 12        # px^2 — filters sensor/sparkle noise
MAX_STONE_AREA = 600       # px^2 — filters leftover merged blobs
                           # tune to your largest real stone at this resolution

# --- Cut-type classification thresholds (aspect ratio = long/short side) ---
BAGUETTE_ASPECT_RATIO = 2.5
MARQUISE_ASPECT_RATIO = 1.5
# NOTE: aspect ratio alone can't tell a Round stone from a Square/Princess
# cut. If you start seeing square stones misclassified as Round, add a
# circularity check (4*pi*area / perimeter^2, close to 1.0 = round) —
# see README "Improving accuracy further".

# --- Display colors (RGB, matches matplotlib's img_rgb) ---
COLOR_MAP = {
    "Round": (0, 255, 0),
    "Baguette": (255, 165, 0),
    "Marquise": (0, 100, 255),
}
