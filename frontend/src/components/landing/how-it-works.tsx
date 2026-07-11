"use client";

import { motion } from "framer-motion";
import { Upload, ScanLine, MousePointerSquareDashed } from "lucide-react";

const STEPS = [
  {
    icon: Upload,
    title: "Upload a photo",
    description: "Drag in any necklace, bracelet or ring photo — PNG, JPG or WEBP up to 20MB.",
  },
  {
    icon: ScanLine,
    title: "AI detects every stone",
    description: "Watch live as the model scans, segments and measures each diamond in the frame.",
  },
  {
    icon: MousePointerSquareDashed,
    title: "Draw a box, get a count",
    description: "Select any region of the piece and instantly see the count and stats for just that area.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            From photo to report in <span className="gradient-text">three steps</span>
          </h2>
        </div>

        <div className="relative mt-16 grid gap-10 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent md:block" />
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative text-center"
            >
              <div className="glass-strong glow-violet relative mx-auto flex h-12 w-12 items-center justify-center rounded-2xl">
                <s.icon className="h-5 w-5 text-[var(--brand-cyan)]" />
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-violet)] text-[10px] font-semibold text-black">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 font-medium">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
                {s.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
