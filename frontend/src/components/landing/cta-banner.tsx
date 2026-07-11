"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="gradient-border relative mx-auto max-w-5xl overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-14"
      >
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-[oklch(0.62_0.24_295_/_25%)] blur-3xl" />
        <h2 className="relative text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready to inspect your next batch?
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-muted-foreground">
          Start counting diamonds in seconds — no setup, no training data required.
        </p>
        <div className="relative mt-8 flex justify-center">
          <Button
            size="lg"
            className="group h-12 gap-2 rounded-xl bg-gradient-to-r from-[var(--brand-cyan)] to-[var(--brand-violet)] px-7 text-black hover:opacity-90"
            asChild
          >
            <Link href="/detection">
              Get started free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
