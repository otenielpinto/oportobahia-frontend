"use client";

import {
  HeroSection,
  FeaturesSection,
  ComparisonSection,
  FAQSection,
  CTASection,
} from "./components";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#121212]">
      <HeroSection />
      <FeaturesSection />
      <ComparisonSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}