import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Diamond } from "@/types/diamond";

function toRows(diamonds: Diamond[]) {
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

function download(blob: Blob, filename: string) {
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

export function exportDiamondsExcel(diamonds: Diamond[], filename = "diamond-report.xlsx") {
  const rows = toRows(diamonds);
  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Diamonds");
  XLSX.writeFile(workbook, filename);
}

export function exportDiamondsPdf(
  diamonds: Diamond[],
  meta: { fileName: string; totalDiamonds: number; accuracy: number },
  filename = "diamond-report.pdf"
) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.text("Diamond Detection Report", 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Source: ${meta.fileName}   |   Total diamonds: ${meta.totalDiamonds}   |   Detection accuracy: ${(meta.accuracy * 100).toFixed(1)}%`,
    14,
    23
  );

  const rows = toRows(diamonds);
  autoTable(doc, {
    startY: 28,
    head: [Object.keys(rows[0] ?? {})],
    body: rows.map((r) => Object.values(r)),
    styles: { fontSize: 7 },
    headStyles: { fillColor: [30, 30, 40] },
  });

  doc.save(filename);
}
