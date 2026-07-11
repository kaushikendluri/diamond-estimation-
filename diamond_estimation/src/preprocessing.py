import cv2
from . import config as cfg


def load_image(path):
    """Load an image from disk. Returns (img_bgr, img_rgb, gray)."""
    img = cv2.imread(path)
    if img is None:
        raise FileNotFoundError(f"Could not read image at: {path}")
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return img, img_rgb, gray


def build_mask(gray):
    """
    CLAHE -> blur -> Otsu threshold -> morphological cleanup.
    Returns (gray_eq, thresh_clean, thresh_closed) so you can inspect
    each stage if detection looks off on a new image.
    """
    clahe = cv2.createCLAHE(clipLimit=cfg.CLAHE_CLIP_LIMIT, tileGridSize=cfg.CLAHE_TILE_GRID)
    gray_eq = clahe.apply(gray)

    blur = cv2.GaussianBlur(gray_eq, cfg.GAUSSIAN_BLUR_KERNEL, 0)

    _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    open_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, cfg.OPEN_KERNEL_SIZE)
    thresh_clean = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, open_kernel, iterations=1)

    close_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, cfg.CLOSE_KERNEL_SIZE)
    thresh_closed = cv2.morphologyEx(thresh_clean, cv2.MORPH_CLOSE, close_kernel, iterations=1)

    return gray_eq, thresh_clean, thresh_closed
