"""
Diamond stone detection + region counting.

Usage:
    python main.py path/to/necklace.jpg
    python main.py path/to/necklace.jpg --multi-box
    python main.py path/to/necklace.jpg --out results.csv --no-display
"""

import argparse
import os

import cv2
import matplotlib.pyplot as plt
import pandas as pd

from src.preprocessing import load_image, build_mask
from src.segmentation import watershed_segment
from src.classifier import extract_stones
from src.visualize import draw_all_stones, draw_roi_box, filter_stones_in_box
from src.roi_tool import select_roi_box, select_multiple_roi_boxes


def run_pipeline(image_path):
    """Runs CLAHE -> threshold -> watershed -> classification. Returns
    (img_bgr, img_rgb, results)."""
    img_bgr, img_rgb, gray = load_image(image_path)
    _, _, thresh_closed = build_mask(gray)
    markers, _dist_transform, _num_markers = watershed_segment(img_bgr, thresh_closed)
    results = extract_stones(markers, gray.shape)
    return img_bgr, img_rgb, results


def show(img_rgb, title=""):
    plt.figure(figsize=(12, 9))
    plt.imshow(img_rgb)
    plt.title(title)
    plt.axis("off")
    plt.show()


def main():
    parser = argparse.ArgumentParser(description="Diamond stone detection & region counting")
    parser.add_argument("image", help="Path to the necklace image")
    parser.add_argument("--multi-box", action="store_true",
                         help="Draw multiple boxes in one session instead of just one")
    parser.add_argument("--out", default="diamond_measurements.csv",
                         help="Where to save the full CSV of detected stones")
    parser.add_argument("--no-display", action="store_true",
                         help="Skip the matplotlib preview windows (still saves CSV)")
    args = parser.parse_args()

    if not os.path.exists(args.image):
        raise FileNotFoundError(args.image)

    print(f"Loading {args.image} ...")
    img_bgr, img_rgb, results = run_pipeline(args.image)
    print(f"\u2705 Total diamonds detected: {len(results)}")

    df = pd.DataFrame(results)
    df.to_csv(args.out, index=False)
    print(f"Saved full measurements to {args.out}")

    annotated = draw_all_stones(img_rgb, results)
    if not args.no_display:
        show(annotated, f"All detected diamonds: {len(results)}")

    print("\nOpening interactive window \u2014 drag a box over a necklace section.")
    print("Press ENTER/SPACE to confirm a box, ESC when finished.\n")

    annotated_bgr = cv2.cvtColor(annotated, cv2.COLOR_RGB2BGR)

    if args.multi_box:
        boxes = select_multiple_roi_boxes(annotated_bgr)
    else:
        box = select_roi_box(annotated_bgr)
        boxes = [box] if box else []

    if not boxes:
        print("No box selected \u2014 exiting.")
        return

    for i, box in enumerate(boxes, start=1):
        in_box = filter_stones_in_box(results, box)
        print(f"\n\U0001f48e Box {i} {box}: {len(in_box)} diamonds")
        by_cut = {}
        for d in in_box:
            by_cut[d["Cut Type"]] = by_cut.get(d["Cut Type"], 0) + 1
        for cut, cnt in by_cut.items():
            print(f"   {cut}: {cnt}")

        if args.no_display:
            continue

        boxed = draw_roi_box(img_rgb, box)
        show(boxed, f"Box {i}: {len(in_box)} diamonds")

        x1, y1, x2, y2 = box
        crop = img_rgb[y1:y2, x1:x2]
        show(crop, f"Zoomed \u2014 Box {i}: {len(in_box)} diamonds")


if __name__ == "__main__":
    main()
