import cv2


def _window_closed(window_name):
    """True if the user closed the window via the X button."""
    return cv2.getWindowProperty(window_name, cv2.WND_PROP_VISIBLE) < 1


def _drag_select(img_bgr, window_name):
    """
    Shows img_bgr in window_name and lets the user drag one box.
    Returns (x1, y1, x2, y2) on ENTER/SPACE with a valid box, or None on
    ESC / closing the window via the X button.
    """
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    cv2.imshow(window_name, img_bgr)

    state = {"start": None, "end": None, "dragging": False}

    def on_mouse(event, x, y, flags, param):
        if event == cv2.EVENT_LBUTTONDOWN:
            state["start"] = (x, y)
            state["end"] = (x, y)
            state["dragging"] = True
        elif event == cv2.EVENT_MOUSEMOVE and state["dragging"]:
            state["end"] = (x, y)
            preview = img_bgr.copy()
            cv2.rectangle(preview, state["start"], state["end"], (0, 255, 0), 2)
            cv2.imshow(window_name, preview)
        elif event == cv2.EVENT_LBUTTONUP:
            state["end"] = (x, y)
            state["dragging"] = False

    cv2.setMouseCallback(window_name, on_mouse)

    result = None
    while True:
        if _window_closed(window_name):
            result = None
            break

        key = cv2.waitKey(20) & 0xFF

        if key == 27:  # ESC
            result = None
            break

        if key in (13, 32) and state["start"] and state["end"]:  # ENTER / SPACE
            x1, y1 = state["start"]
            x2, y2 = state["end"]
            x1, x2 = sorted((x1, x2))
            y1, y2 = sorted((y1, y2))
            result = (x1, y1, x2, y2) if (x2 > x1 and y2 > y1) else None
            break

    if not _window_closed(window_name):
        cv2.destroyWindow(window_name)
    return result


def select_roi_box(img_bgr, window_name="Drag a box, then press ENTER (ESC to cancel)"):
    """
    Opens a native OpenCV window. Click-drag a rectangle with the mouse
    over the section of the necklace you want to count.
    Press ENTER or SPACE to confirm, ESC or the window's close (X) button
    to cancel.
    Returns (x1, y1, x2, y2) in original image pixel coordinates, or None
    if cancelled / zero-area.
    """
    return _drag_select(img_bgr, window_name)


def select_multiple_roi_boxes(img_bgr, window_name="Draw boxes: ENTER after each, ESC to finish"):
    """
    Lets you draw several boxes in one session (e.g. multiple sections
    of the same necklace). Press ENTER/SPACE after each box; ESC or the
    window's close (X) button finishes the session.
    Returns a list of (x1, y1, x2, y2) tuples.
    """
    boxes = []
    while True:
        box = _drag_select(img_bgr, window_name)
        if box is None:
            break
        boxes.append(box)
        if _window_closed(window_name):
            break
    return boxes
