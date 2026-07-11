"use client";

import { useMemo, useState } from "react";
import {
  Search,
  MoreVertical,
  Eye,
  Trash2,
  Download,
  Sparkles,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { useHistoryStore } from "@/store/history-store";
import { formatDate, formatDuration, formatPercent } from "@/lib/format";
import { exportDiamondsCsv } from "@/lib/export";
import { HistoryViewerDialog } from "@/components/history/history-viewer-dialog";
import { DetectionResult } from "@/types/diamond";
import { toast } from "sonner";

export default function HistoryPage() {
  const results = useHistoryStore((s) => s.results);
  const removeResult = useHistoryStore((s) => s.removeResult);
  const clearHistory = useHistoryStore((s) => s.clearHistory);
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<DetectionResult | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return results;
    const q = search.trim().toLowerCase();
    return results.filter((r) => r.fileName.toLowerCase().includes(q));
  }, [results, search]);

  return (
    <div>
      <PageHeader
        title="History"
        description="Every image you've analyzed, with quick access to reports."
        actions={
          results.length > 0 && (
            <Button
              variant="outline"
              className="glass gap-2 border-white/15 text-muted-foreground"
              onClick={() => {
                clearHistory();
                toast.success("History cleared.");
              }}
            >
              <Trash2 className="h-4 w-4" /> Clear all
            </Button>
          )
        }
      />

      <div className="glass rounded-3xl p-5">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename..."
            className="border-white/15 bg-white/5 pl-8"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="glass-strong flex h-12 w-12 items-center justify-center rounded-2xl">
              <Sparkles className="h-5 w-5 text-[var(--brand-cyan)]" />
            </div>
            <p className="text-sm text-muted-foreground">
              {results.length === 0
                ? "No uploads yet — your detection history will appear here."
                : "No uploads match your search."}
            </p>
            {results.length === 0 && (
              <Button size="sm" variant="outline" className="glass border-white/15" asChild>
                <Link href="/detection">
                  <Upload className="mr-2 h-3.5 w-3.5" /> Upload image
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="scrollbar-thin mt-4 overflow-x-auto rounded-xl border border-white/10">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Image</TableHead>
                  <TableHead>Upload date</TableHead>
                  <TableHead>Diamonds detected</TableHead>
                  <TableHead>Processing time</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={r.processedImageUrl} alt={r.fileName} className="h-10 w-10 rounded-lg object-cover" />
                        <span className="max-w-[14rem] truncate text-sm font-medium">{r.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</TableCell>
                    <TableCell className="text-sm">{r.totalDiamonds}</TableCell>
                    <TableCell className="text-sm">{formatDuration(r.processingTimeMs)}</TableCell>
                    <TableCell className="text-sm">{formatPercent(r.detectionAccuracy)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-emerald-400/30 bg-emerald-400/15 text-emerald-400">
                        Completed
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-strong">
                          <DropdownMenuItem onClick={() => setViewing(r)}>
                            <Eye className="h-4 w-4" /> Open
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => exportDiamondsCsv(r.diamonds, `${r.fileName}-report.csv`)}
                          >
                            <Download className="h-4 w-4" /> Download report
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              removeResult(r.id);
                              toast.success("Removed from history.");
                            }}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <HistoryViewerDialog result={viewing} onOpenChange={(open) => !open && setViewing(null)} />
    </div>
  );
}
