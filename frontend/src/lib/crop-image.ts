import { BoundingBox } from "@/types/diamond";

export function cropDiamond(
  imageUrl: string,
  bbox: BoundingBox,
  padding = 0.6
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = bbox.x2 - bbox.x1;
      const h = bbox.y2 - bbox.y1;
      const padX = w * padding;
      const padY = h * padding;

      const sx = Math.max(0, bbox.x1 - padX);
      const sy = Math.max(0, bbox.y1 - padY);
      const sw = Math.min(img.naturalWidth - sx, w + padX * 2);
      const sh = Math.min(img.naturalHeight - sy, h + padY * 2);

      const canvas = document.createElement("canvas");
      const scale = 4;
      canvas.width = sw * scale;
      canvas.height = sh * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas unavailable"));
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}
