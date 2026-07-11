"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Ruler, Zap, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "AI Detection",
    description:
      "A watershed-augmented CNN pipeline isolates every individual stone, even in dense clusters and touching settings.",
    hue: "cyan" as const,
  },
  {
    icon: Ruler,
    title: "Precise Measurements",
    description:
      "Sub-pixel width, height, area and aspect ratio for every diamond, calibrated to your image resolution.",
    hue: "violet" as const,
  },
  {
    icon: Zap,
    title: "Fast Analysis",
    description:
      "Full detection and reporting in under three seconds, with a live progress view of every processing stage.",
    hue: "pink" as const,
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-Ready Inspection",
    description:
      "Audit-friendly exports, region-based counting, and confidence scoring built for manufacturing and grading labs.",
    hue: "cyan" as const,
  },
];

const HUE_CLASS = {
  cyan: "from-[var(--brand-cyan)]/20 to-[var(--brand-cyan)]/5 text-[var(--brand-cyan)]",
  violet: "from-[var(--brand-violet)]/20 to-[var(--brand-violet)]/5 text-[var(--brand-violet)]",
  pink: "from-[var(--brand-pink)]/20 to-[var(--brand-pink)]/5 text-[var(--brand-pink)]",
};

export function Features() {
  return (
    <section id="features" className="relative px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need for <span className="gradient-text">stone-level inspection</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Purpose-built detection tooling for jewelry manufacturers and diamond
            inspection laboratories.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass group rounded-2xl p-6 transition-transform hover:-translate-y-1"
            >
              <div
                className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${HUE_CLASS[f.hue]}`}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-medium">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
