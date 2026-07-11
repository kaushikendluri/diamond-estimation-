"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Images,
  Gem,
  Target,
  Timer,
  CheckCircle2,
  ArrowRight,
  Upload,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { useHistoryStore } from "@/store/history-store";
import { computeDashboardStats } from "@/lib/derive-stats";
import { formatDate, formatPercent } from "@/lib/format";

export default function DashboardPage() {
  const history = useHistoryStore((s) => s.results);
  const stats = computeDashboardStats(history);
  const recent = history.slice(0, 6);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="A live overview of your diamond detection activity."
        actions={
          <Button
            className="gap-2 rounded-xl bg-gradient-to-r from-[var(--brand-cyan)] to-[var(--brand-violet)] text-black hover:opacity-90"
            asChild
          >
            <Link href="/detection">
              <Upload className="h-4 w-4" /> New detection
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard
          index={0}
          label="Total Images Processed"
          value={stats.totalImagesProcessed}
          icon={Images}
          hue="cyan"
          trend={4.2}
        />
        <StatCard
          index={1}
          label="Total Diamonds Detected"
          value={stats.totalDiamondsDetected}
          icon={Gem}
          hue="violet"
          trend={8.1}
        />
        <StatCard
          index={2}
          label="Detection Accuracy"
          value={stats.detectionAccuracy * 100}
          icon={Target}
          hue="pink"
          decimals={1}
          suffix="%"
          trend={0.6}
        />
        <StatCard
          index={3}
          label="Avg. Processing Time"
          value={stats.averageProcessingTimeMs / 1000}
          icon={Timer}
          hue="amber"
          decimals={2}
          suffix="s"
          trend={-3.4}
        />
        <StatCard
          index={4}
          label="Success Rate"
          value={stats.successRate * 100}
          icon={CheckCircle2}
          hue="cyan"
          decimals={1}
          suffix="%"
          trend={0.2}
        />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="glass rounded-2xl p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Recent detections</h2>
            <Link
              href="/history"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
              <div className="glass-strong flex h-12 w-12 items-center justify-center rounded-2xl">
                <Sparkles className="h-5 w-5 text-[var(--brand-cyan)]" />
              </div>
              <p className="text-sm text-muted-foreground">
                No detections yet. Upload a jewelry photo to get started.
              </p>
              <Button size="sm" variant="outline" className="glass border-white/15" asChild>
                <Link href="/detection">Upload image</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-white/5">
              {recent.map((r) => (
                <div key={r.id} className="flex items-center gap-3 py-3">
                  <img
                    src={r.processedImageUrl}
                    alt={r.fileName}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.fileName}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{r.totalDiamonds} diamonds</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPercent(r.detectionAccuracy)} accuracy
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.4 }}
          className="glass-strong glow-violet flex flex-col justify-between rounded-2xl p-6"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-cyan)] to-[var(--brand-violet)]">
              <Gem className="h-5 w-5 text-black" />
            </div>
            <h3 className="mt-4 font-medium">Run a new inspection</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Drop in a necklace, bracelet or ring photo and get a full stone-by-stone
              breakdown in seconds, plus region-based counting for any section you select.
            </p>
          </div>
          <Button
            className="mt-6 w-full gap-2 rounded-xl bg-gradient-to-r from-[var(--brand-cyan)] to-[var(--brand-violet)] text-black hover:opacity-90"
            asChild
          >
            <Link href="/detection">
              <Upload className="h-4 w-4" /> Upload image
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
