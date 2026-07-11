import { Diamond } from "@/types/diamond";
import { SelectionRect } from "@/components/detection/detection-context";

export function diamondsInRect(diamonds: Diamond[], rect: SelectionRect): Diamond[] {
  const x1 = Math.min(rect.x1, rect.x2);
  const x2 = Math.max(rect.x1, rect.x2);
  const y1 = Math.min(rect.y1, rect.y2);
  const y2 = Math.max(rect.y1, rect.y2);

  return diamonds.filter((d) => {
    const cx = d.x + d.width / 2;
    const cy = d.y + d.height / 2;
    return cx >= x1 && cx <= x2 && cy >= y1 && cy <= y2;
  });
}

export function selectionStats(diamonds: Diamond[]) {
  const count = diamonds.length;
  const avgWidth = count ? diamonds.reduce((a, d) => a + d.width, 0) / count : 0;
  const avgHeight = count ? diamonds.reduce((a, d) => a + d.height, 0) / count : 0;
  const totalArea = diamonds.reduce((a, d) => a + d.area, 0);
  return { count, avgWidth, avgHeight, totalArea };
}

export function normalizeRect(rect: SelectionRect): SelectionRect {
  return {
    x1: Math.min(rect.x1, rect.x2),
    y1: Math.min(rect.y1, rect.y2),
    x2: Math.max(rect.x1, rect.x2),
    y2: Math.max(rect.y1, rect.y2),
  };
}
