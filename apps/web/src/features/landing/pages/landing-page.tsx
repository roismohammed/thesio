import { useSeoMeta } from "@/hooks/use-seo-meta"
import { LandingHeader } from "@/features/landing/components/landing-header"
import { HeroSection } from "@/features/landing/components/hero-section"
import { TrustedMarquee } from "@/features/landing/components/trusted-marquee"
import { HowItWorksSection } from "@/features/landing/components/how-it-works-section"
import { FeaturesOverviewSection } from "@/features/landing/components/features-overview-section"
import { TestimonialsSection } from "@/features/landing/components/testimonials-section"
import { PricingSection } from "@/features/landing/components/pricing-section"
import { WhyUsSection } from "@/features/landing/components/why-us-section"
import { FaqSection } from "@/features/landing/components/faq-section"
import { CtaSection } from "@/features/landing/components/cta-section"
import { LandingFooter } from "@/features/landing/components/landing-footer"
import { ScrollToTopButton } from "@/features/landing/components/scroll-to-top-button"

export function LandingPage() {
  useSeoMeta({
    title: "Thesio — Platform Manajemen Skripsi Mandiri & Terstruktur",
    description:
      "Selesaikan skripsi lebih cepat dengan alur kerja digital yang terstruktur: dari judul, bab 1-5, notulen dosen hingga kanban tugas.",
    path: "/",
  })

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/15 selection:text-primary antialiased font-sans">
      <LandingHeader />
      <HeroSection />
      <TrustedMarquee />
      <HowItWorksSection />
      <FeaturesOverviewSection />
      <TestimonialsSection />
      <PricingSection />
      <WhyUsSection />
      <FaqSection />
      <CtaSection />
      <LandingFooter />
      <ScrollToTopButton />
    </div>
  )
}
