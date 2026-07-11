export function getImageDimensions(
  file: File | string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = typeof file === "string" ? file : URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      if (typeof file !== "string") URL.revokeObjectURL(url);
    };
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

export function fileToThumbnailDataUrl(
  file: File,
  maxWidth = 480,
  quality = 0.72
): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.naturalWidth);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
      URL.revokeObjectURL(url);
    };
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}
