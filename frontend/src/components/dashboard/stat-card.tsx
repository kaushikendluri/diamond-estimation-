"use client";

import { motion } from "framer-motion";
import { type LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  trend?: number;
  hue?: "cyan" | "violet" | "pink" | "amber";
  index?: number;
}

const HUE_CLASS: Record<NonNullable<StatCardProps["hue"]>, string> = {
  cyan: "from-[var(--brand-cyan)]/20 to-transparent text-[var(--brand-cyan)]",
  violet: "from-[var(--brand-violet)]/20 to-transparent text-[var(--brand-violet)]",
  pink: "from-[var(--brand-pink)]/20 to-transparent text-[var(--brand-pink)]",
  amber: "from-amber-400/20 to-transparent text-amber-400",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  decimals = 0,
  suffix = "",
  prefix = "",
  trend,
  hue = "cyan",
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="glass group relative overflow-hidden rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
    >
      <div
        className={cn(
          "absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-70 blur-2xl transition-opacity group-hover:opacity-100",
          HUE_CLASS[hue]
        )}
      />
      <div className="relative flex items-start justify-between">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br",
            HUE_CLASS[hue]
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
        {trend !== undefined && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              trend >= 0 ? "text-emerald-400" : "text-red-400"
            )}
          >
            {trend >= 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="relative mt-4 text-2xl font-semibold tabular-nums sm:text-[1.7rem]">
        <AnimatedCounter value={value} decimals={decimals} suffix={suffix} prefix={prefix} />
      </p>
      <p className="relative mt-1 text-xs text-muted-foreground">{label}</p>
    </motion.div>
  );
}
