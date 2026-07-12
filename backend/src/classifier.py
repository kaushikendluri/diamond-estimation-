import cv2
import numpy as np
from . import config as cfg


def classify_cut(rot_w, rot_h):
    """Classify a stone's cut from its rotated bounding box dimensions."""
    long_side = max(rot_w, rot_h)
    short_side = min(rot_w, rot_h) + 1e-5
    aspect_ratio = long_side / short_side

    if aspect_ratio > cfg.BAGUETTE_ASPECT_RATIO:
        return "Baguette", aspect_ratio
    elif aspect_ratio > cfg.MARQUISE_ASPECT_RATIO:
        return "Marquise", aspect_ratio
    else:
        return "Round", aspect_ratio


def extract_stones(markers, gray_shape):
    """
    Walk each watershed label, extract its contour, filter by area,
    and build a measurement + cut-type record per stone.
    """
    results = []
    unique_labels = np.unique(markers)
    unique_labels = unique_labels[unique_labels > 1]  # drop background (-1) and border (1)

    for label in unique_labels:
        mask = np.zeros(gray_shape, dtype=np.uint8)
        mask[markers == label] = 255

        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            continue

        cnt = max(contours, key=cv2.contourArea)
        area = cv2.contourArea(cnt)

        if area < cfg.MIN_STONE_AREA or area > cfg.MAX_STONE_AREA:
            continue

        x, y, w, h = cv2.boundingRect(cnt)
        rect = cv2.minAreaRect(cnt)
        rot_w, rot_h = rect[1]

        cut_type, aspect_ratio = classify_cut(rot_w, rot_h)

        results.append({
            "Diamond #": len(results) + 1,
            "Cut Type": cut_type,
            "X (px)": x,
            "Y (px)": y,
            "Width (px)": round(rot_w, 1),
            "Height (px)": round(rot_h, 1),
            "Area (px\u00b2)": round(area, 1),
            "Aspect Ratio": round(aspect_ratio, 2),
        })

    return results
