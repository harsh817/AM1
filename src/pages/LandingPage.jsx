import { ProblemSection, ProfessionalStylingSection, WasteSection, YouFirstSection } from "./landing/EditorialSections.jsx";
import { Hero } from "./landing/Hero.jsx";
import { BonusesSection, ComparisonSection, ProcessSection, RecapSection, ReportContents, StyleIqSystem } from "./landing/OfferSections.jsx";
import { FAQ, Footer, SocialProof } from "./landing/SocialProofSections.jsx";
import { StickyBuyBar } from "./landing/StickyBuyBar.jsx";
import { TrustSection } from "./landing/TrustSection.jsx";

export function LandingPage() {
  return (
    <>
      <main>
        <Hero />
        <TrustSection />
        <ProblemSection />
        <WasteSection />
        <YouFirstSection />
        <ProfessionalStylingSection />
        <StyleIqSystem />
        <ComparisonSection />
        <ReportContents />
        <BonusesSection />
        <ProcessSection />
        <SocialProof />
        <RecapSection />
        <FAQ />
      </main>
      <Footer />
      <StickyBuyBar />
    </>
  );
}
