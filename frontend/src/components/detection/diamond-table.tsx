"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  FileJson,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Diamond, DiamondStatus } from "@/types/diamond";
import { useDetection } from "./detection-context";
import { exportDiamondsCsv } from "@/lib/export";
import { cn } from "@/lib/utils";

type SortKey = "id" | "confidence" | "width" | "height" | "area" | "x" | "y";
type SortDir = "asc" | "desc";

const STATUS_BADGE: Record<DiamondStatus, string> = {
  verified: "bg-emerald-400/15 text-emerald-400 border-emerald-400/30",
  pending: "bg-amber-400/15 text-amber-400 border-amber-400/30",
  flagged: "bg-rose-400/15 text-rose-400 border-rose-400/30",
};

const PAGE_SIZE = 8;

export function DiamondTable() {
  const { result, selectedId, hoveredId, setSelectedId, setHoveredId, requestZoomTo, setDetailOpen } =
    useDetection();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DiamondStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let rows = result.diamonds;
    if (statusFilter !== "all") rows = rows.filter((d) => d.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (d) =>
          `${d.id}`.includes(q) ||
          d.cutType?.toLowerCase().includes(q) ||
          d.status.toLowerCase().includes(q)
      );
    }
    const sorted = [...rows].sort((a, b) => {
      const av = sortKey === "id" ? a.id : sortKey === "confidence" ? a.confidence : a[sortKey];
      const bv = sortKey === "id" ? b.id : sortKey === "confidence" ? b.confidence : b[sortKey];
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return sorted;
  }, [result.diamonds, search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const selectRow = (d: Diamond) => {
    setSelectedId(d.id);
    requestZoomTo(d.id);
    setDetailOpen(true);
  };

  const columns: { key: SortKey | "bbox" | "status"; label: string; sortable?: boolean }[] = [
    { key: "id", label: "Diamond ID", sortable: true },
    { key: "confidence", label: "Confidence", sortable: true },
    { key: "width", label: "Width", sortable: true },
    { key: "height", label: "Height", sortable: true },
    { key: "area", label: "Area", sortable: true },
    { key: "x", label: "X", sortable: true },
    { key: "y", label: "Y", sortable: true },
    { key: "bbox", label: "Bounding Box" },
    { key: "status", label: "Status" },
  ];

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-medium">Detected Diamonds</h2>
          <p className="text-xs text-muted-foreground">
            {filtered.length} of {result.diamonds.length} diamonds
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search ID, cut, status..."
              className="w-48 border-white/15 bg-white/5 pl-8"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as DiamondStatus | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-32 border-white/15 bg-white/5">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="glass gap-1.5 border-white/15">
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-strong">
              <DropdownMenuItem onClick={() => exportDiamondsCsv(filtered, `${result.fileName}-diamonds.csv`)}>
                <FileJson className="h-4 w-4" /> Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  const { exportDiamondsExcel } = await import("@/lib/export-excel");
                  exportDiamondsExcel(filtered, `${result.fileName}-diamonds.xlsx`);
                }}
              >
                <FileSpreadsheet className="h-4 w-4" /> Export Excel
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  const { exportDiamondsPdf } = await import("@/lib/export-pdf");
                  exportDiamondsPdf(
                    filtered,
                    {
                      fileName: result.fileName,
                      totalDiamonds: result.totalDiamonds,
                      accuracy: result.detectionAccuracy,
                    },
                    `${result.fileName}-diamonds.pdf`
                  );
                }}
              >
                <FileText className="h-4 w-4" /> Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="scrollbar-thin mt-4 overflow-x-auto rounded-xl border border-white/10">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  onClick={() => col.sortable && toggleSort(col.key as SortKey)}
                  className={cn("whitespace-nowrap text-xs", col.sortable && "cursor-pointer select-none")}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable &&
                      (sortKey === col.key ? (
                        sortDir === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-30" />
                      ))}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-muted-foreground">
                  No diamonds match your filters.
                </TableCell>
              </TableRow>
            )}
            {pageRows.map((d) => (
              <TableRow
                key={d.id}
                onClick={() => selectRow(d)}
                onMouseEnter={() => setHoveredId(d.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={cn(
                  "cursor-pointer text-xs",
                  (selectedId === d.id || hoveredId === d.id) && "bg-[var(--brand-cyan)]/10"
                )}
              >
                <TableCell className="font-medium">#{d.id}</TableCell>
                <TableCell>{(d.confidence * 100).toFixed(1)}%</TableCell>
                <TableCell>{d.width.toFixed(1)}px</TableCell>
                <TableCell>{d.height.toFixed(1)}px</TableCell>
                <TableCell>{d.area.toFixed(0)}px²</TableCell>
                <TableCell>{d.x.toFixed(0)}</TableCell>
                <TableCell>{d.y.toFixed(0)}</TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  ({d.bbox.x1.toFixed(0)}, {d.bbox.y1.toFixed(0)}) → ({d.bbox.x2.toFixed(0)}, {d.bbox.y2.toFixed(0)})
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("capitalize", STATUS_BADGE[d.status])}>
                    {d.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="glass h-7 w-7 border-white/15 p-0"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="glass h-7 w-7 border-white/15 p-0"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
