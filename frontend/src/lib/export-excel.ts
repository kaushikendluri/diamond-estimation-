import { Diamond } from "@/types/diamond";
import { toRows } from "./export";

/** Loaded via dynamic import() at the call site — `xlsx` is large and only needed when a user actually exports. */
export async function exportDiamondsExcel(diamonds: Diamond[], filename = "diamond-report.xlsx") {
  const XLSX = await import("xlsx");
  const rows = toRows(diamonds);
  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Diamonds");
  XLSX.writeFile(workbook, filename);
}
