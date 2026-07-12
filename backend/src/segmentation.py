import cv2
import numpy as np
from scipy import ndimage as ndi
from skimage.feature import peak_local_max
from . import config as cfg


def watershed_segment(img_bgr, thresh_closed):
    """
    Distance transform + local-maxima markers + watershed.
    Splits touching/clustered stones into separate regions.
    Returns (markers, dist_transform, num_markers).
    """
    dist_transform = cv2.distanceTransform(thresh_closed, cv2.DIST_L2, 5)

    coords = peak_local_max(
        dist_transform, min_distance=cfg.MIN_PEAK_DISTANCE, labels=thresh_closed
    )
    peak_mask = np.zeros(dist_transform.shape, dtype=bool)
    peak_mask[tuple(coords.T)] = True
    markers, num_markers = ndi.label(peak_mask)

    dilate_kernel = np.ones(cfg.BG_DILATE_KERNEL, np.uint8)
    sure_bg = cv2.dilate(thresh_closed, dilate_kernel, iterations=cfg.BG_DILATE_ITERS)
    unknown = cv2.subtract(sure_bg, (markers > 0).astype(np.uint8) * 255)

    markers = markers + 1
    markers[unknown == 255] = 0

    img_ws = img_bgr.copy()
    markers = cv2.watershed(img_ws, markers)

    return markers, dist_transform, num_markers
