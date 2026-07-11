"use client";

import Link from "next/link";
import {
  Upload,
  ScanLine,
  MousePointerSquareDashed,
  Table2,
  BarChart3,
  Settings as SettingsIcon,
  Mail,
  LifeBuoy,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

const FAQS = [
  {
    icon: Upload,
    q: "What image formats and sizes are supported?",
    a: "PNG, JPG, JPEG and WEBP images up to 20MB. You can drag & drop, browse, or paste an image directly from your clipboard.",
  },
  {
    icon: ScanLine,
    q: "How accurate is the detection?",
    a: "Detection accuracy typically runs in the high 90s and is shown per-image on the Detection page and Dashboard. Confidence thresholds can be tuned in Settings.",
  },
  {
    icon: MousePointerSquareDashed,
    q: "How do I count diamonds in just one part of the image?",
    a: "On the processed image, click 'Selection Mode', then click-drag a rectangle over the section you care about. The count, average size and total area for that region update live, and you can resize the box or download just that region's report.",
  },
  {
    icon: Table2,
    q: "Can I export my results?",
    a: "Yes — the diamond table supports CSV, Excel and PDF export, both for the full result set and for any manually selected region.",
  },
  {
    icon: BarChart3,
    q: "Where can I see trends across multiple uploads?",
    a: "The Analytics page charts detection trends, size and confidence distributions, processing time, and upload history over the last two weeks.",
  },
  {
    icon: SettingsIcon,
    q: "How do I connect a real detection backend?",
    a: "Set your API endpoint in Settings and flip NEXT_PUBLIC_USE_MOCK=false — the service layer already matches the expected /upload and /detect contract.",
  },
];

export default function HelpPage() {
  return (
    <div>
      <PageHeader
        title="Help & Support"
        description="Guides, FAQs, and ways to reach the team."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {FAQS.map((f) => (
          <div key={f.q} className="glass rounded-2xl p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-cyan)]/20 to-transparent text-[var(--brand-cyan)]">
              <f.icon className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-sm font-medium">{f.q}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </div>

      <div className="glass-strong glow-violet mt-5 flex flex-col items-center gap-4 rounded-2xl p-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-cyan)] to-[var(--brand-violet)]">
            <LifeBuoy className="h-5 w-5 text-black" />
          </div>
          <div>
            <p className="font-medium">Still need help?</p>
            <p className="text-sm text-muted-foreground">Our support team responds within one business day.</p>
          </div>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-[var(--brand-cyan)] to-[var(--brand-violet)] text-black hover:opacity-90" asChild>
          <Link href="mailto:support@lumina-ai.com">
            <Mail className="h-4 w-4" /> Contact support
          </Link>
        </Button>
      </div>
    </div>
  );
}
