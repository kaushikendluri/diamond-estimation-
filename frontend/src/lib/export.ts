import { Diamond } from "@/types/diamond";

export function toRows(diamonds: Diamond[]) {
  return diamonds.map((d) => ({
    "Diamond ID": d.id,
    "Confidence": `${(d.confidence * 100).toFixed(1)}%`,
    "Width (px)": d.width,
    "Height (px)": d.height,
    "Area (px²)": d.area,
    "X": d.x,
    "Y": d.y,
    "Bounding Box": `(${d.bbox.x1.toFixed(0)}, ${d.bbox.y1.toFixed(0)}) → (${d.bbox.x2.toFixed(0)}, ${d.bbox.y2.toFixed(0)})`,
    "Cut Type": d.cutType ?? "",
    "Status": d.status,
  }));
}

export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportDiamondsCsv(diamonds: Diamond[], filename = "diamond-report.csv") {
  const rows = toRows(diamonds);
  const headers = Object.keys(rows[0] ?? {});
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => `"${String(r[h as keyof typeof r]).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  download(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename);
}
