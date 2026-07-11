"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Gem, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticlesBackground } from "@/components/shared/particles-background";

const STATS = [
  { label: "Diamonds detected", value: "12.4M+" },
  { label: "Detection accuracy", value: "98.7%" },
  { label: "Avg. processing time", value: "2.1s" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-20 pb-24 lg:pt-28 lg:pb-32">
      <ParticlesBackground count={30} />

      <div className="relative mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass mx-auto mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 text-[var(--brand-cyan)]" />
          Trusted by jewelry manufacturers &amp; grading labs worldwide
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
        >
          AI Diamond Detection <br className="hidden sm:block" />
          &amp; <span className="gradient-text">Measurement Platform</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg"
        >
          Upload any jewelry image and instantly detect every diamond using AI.
          View the total diamond count, individual measurements, confidence
          scores, and detailed analytics within seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button
            size="lg"
            className="group h-12 gap-2 rounded-xl bg-gradient-to-r from-[var(--brand-cyan)] to-[var(--brand-violet)] px-7 text-black shadow-lg shadow-violet-500/20 hover:opacity-90"
            asChild
          >
            <Link href="/detection">
              <Gem className="h-4.5 w-4.5" />
              Upload Image
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="glass h-12 gap-2 rounded-xl border-white/15 px-7 hover:bg-white/10"
            asChild
          >
            <Link href="/detection?demo=true">
              <Play className="h-4 w-4" />
              Try Demo
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-strong mx-auto mt-16 grid max-w-2xl grid-cols-3 divide-x divide-white/10 rounded-2xl py-6"
        >
          {STATS.map((s) => (
            <div key={s.label} className="px-2 text-center sm:px-4">
              <p className="gradient-text text-2xl font-semibold sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
