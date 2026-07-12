import cv2
from . import config as cfg


def draw_all_stones(img_rgb, results):
    """Draw every detected stone's box + index number, colored by cut type."""
    output = img_rgb.copy()
    for r in results:
        x, y = int(r["X (px)"]), int(r["Y (px)"])
        w, h = int(r["Width (px)"]), int(r["Height (px)"])
        color = cfg.COLOR_MAP.get(r["Cut Type"], (255, 0, 0))
        cv2.rectangle(output, (x, y), (x + w, y + h), color, 1)
        cv2.putText(output, str(r["Diamond #"]), (x, y - 2),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.3, color, 1)
    return output


def draw_roi_box(img_rgb, box, color=(255, 0, 0)):
    """Draw a single ROI rectangle for reference."""
    output = img_rgb.copy()
    x1, y1, x2, y2 = box
    cv2.rectangle(output, (x1, y1), (x2, y2), color, 2)
    return output


def filter_stones_in_box(results, box):
    """Keep only stones whose center point falls inside the given box."""
    x1, y1, x2, y2 = box
    inside = []
    for r in results:
        cx = r["X (px)"] + r["Width (px)"] / 2
        cy = r["Y (px)"] + r["Height (px)"] / 2
        if x1 <= cx <= x2 and y1 <= cy <= y2:
            inside.append(r)
    return inside
