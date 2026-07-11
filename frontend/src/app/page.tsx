import { LandingNav } from "@/components/landing/landing-nav";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CtaBanner } from "@/components/landing/cta-banner";
import { LandingFooter } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="bg-grid pointer-events-none fixed inset-0 opacity-[0.35]" />
      <LandingNav />
      <main className="relative flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <CtaBanner />
      </main>
      <LandingFooter />
    </div>
  );
}
