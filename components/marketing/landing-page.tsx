import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { HighlightCards } from "@/components/marketing/highlight-cards";
import { Features } from "@/components/marketing/features";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Reliability } from "@/components/marketing/reliability";
import { Pricing } from "@/components/marketing/pricing";
import { Faq } from "@/components/marketing/faq";
import { CtaSection } from "@/components/marketing/cta-section";
import { Footer } from "@/components/marketing/footer";
import { PlanLimits } from "@/lib/types";

export function LandingPage({ plans }: { plans?: PlanLimits[] }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <HighlightCards />
        <Features />
        <HowItWorks />
        <Reliability />
        <Pricing plans={plans} />
        <Faq />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
