import { Diamond } from "@/types/diamond";
import { toRows } from "./export";

/** Loaded via dynamic import() at the call site — `jspdf`/`jspdf-autotable` are large and only needed when a user actually exports. */
export async function exportDiamondsPdf(
  diamonds: Diamond[],
  meta: { fileName: string; totalDiamonds: number; accuracy: number },
  filename = "diamond-report.pdf"
) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

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
