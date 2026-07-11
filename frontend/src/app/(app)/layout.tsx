"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useThemeSync } from "@/hooks/use-theme";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useThemeSync();

  return (
    <div className="relative min-h-screen bg-background">
      <div className="bg-grid pointer-events-none fixed inset-0 opacity-[0.35]" />
      <Sidebar />
      <div className="relative lg:pl-64">
        <Topbar />
        <main className="mx-auto max-w-[1600px] px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
