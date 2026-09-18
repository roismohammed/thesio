import { useTranslation } from "react-i18next"

import { AppLayout } from "@/components/layout/app-layout"
import { useSeoMeta } from "@/hooks/use-seo-meta"
import { TemaSection } from "@/pages/(authenticated)/pengaturan/sections/tema-section"
import { WarnaAccentSection } from "@/pages/(authenticated)/pengaturan/sections/warna-accent-section"
import { VarianSidebarSection } from "@/pages/(authenticated)/pengaturan/sections/varian-sidebar-section"
import { BahasaSection } from "@/pages/(authenticated)/pengaturan/sections/bahasa-section"

export function PengaturanPage() {
  const { t } = useTranslation()
  const dashboard = t("breadcrumb.dashboard")
  const settings = t("breadcrumb.settings")

  useSeoMeta({
    title: t("seo.pages.settings.title"),
    description: t("seo.pages.settings.description"),
    path: "/pengaturan",
  })

  return (
    <AppLayout
      pageTitle={settings}
      breadcrumb={[
        { title: dashboard, url: "/" },
        { title: settings },
      ]}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("page.settings.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("page.settings.description")}
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <TemaSection />
          <WarnaAccentSection />
          <VarianSidebarSection />
          <BahasaSection />
        </div>
      </div>
    </AppLayout>
  )
}