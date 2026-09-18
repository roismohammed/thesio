import { useSeoMeta } from "@/hooks/use-seo-meta"
import { LandingHeader } from "@/features/landing/components/landing-header"
import { IntegrationHero } from "@/features/integrations/components/integration-hero"
import { IntegrationGrid } from "@/features/integrations/components/integration-grid"
import { IntegrationComparison } from "@/features/integrations/components/integration-comparison"
import { CtaSection } from "@/features/landing/components/cta-section"
import { LandingFooter } from "@/features/landing/components/landing-footer"
import { ScrollToTopButton } from "@/features/landing/components/scroll-to-top-button"

export function IntegrationsPage() {
  useSeoMeta({
    title: "Integrasi — Thesio: Platform Manajemen Skripsi Terpadu",
    description:
      "Hubungkan manajer referensi Mendeley, Google Drive, Microsoft Word, dan alat akademik lainnya secara instan dengan Thesio.",
    path: "/integrations",
  })

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/15 selection:text-primary antialiased font-sans">
      <LandingHeader />
      <main className="flex-1">
        <IntegrationHero />
        <IntegrationGrid />
        <IntegrationComparison />
        <CtaSection />
      </main>
      <LandingFooter />
      <ScrollToTopButton />
    </div>
  )
}
