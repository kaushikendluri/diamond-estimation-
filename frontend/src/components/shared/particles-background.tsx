"use client";

import { useEffect, useState } from "react";

interface Particle {
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
  hue: "cyan" | "violet" | "pink";
}

const HUE_COLOR: Record<Particle["hue"], string> = {
  cyan: "var(--brand-cyan)",
  violet: "var(--brand-violet)",
  pink: "var(--brand-pink)",
};

function generateParticles(count: number): Particle[] {
  const hues: Particle["hue"][] = ["cyan", "violet", "pink"];
  return Array.from({ length: count }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: 2 + Math.random() * 4,
    duration: 8 + Math.random() * 10,
    delay: Math.random() * -18,
    hue: hues[i % hues.length],
  }));
}

export function ParticlesBackground({ count = 26 }: { count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Particle positions are randomized client-only (post-mount) to avoid
    // server/client hydration mismatches; the set-state-in-effect rule
    // doesn't distinguish this from a derived-state anti-pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticles(generateParticles(count));
  }, [count]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-[oklch(0.62_0.24_295_/_18%)] blur-3xl" />
      <div className="absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-[oklch(0.78_0.15_200_/_16%)] blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-[24rem] w-[24rem] rounded-full bg-[oklch(0.7_0.2_350_/_12%)] blur-3xl" />
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: HUE_COLOR[p.hue],
            boxShadow: `0 0 ${p.size * 3}px ${HUE_COLOR[p.hue]}`,
            animation: `float-particle ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
