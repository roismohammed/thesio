import { useTranslation } from "react-i18next"

import {
  InsetCard,
  InsetCardContent,
  InsetCardHeader,
  InsetCardTitle,
} from "@/components/ui/inset-card"
import type { DashboardSupervision } from "@/features/dasbor/types"

export function SupervisionNote({ supervision }: { supervision: DashboardSupervision }) {
  const { t } = useTranslation()

  return (
    <InsetCard>
      <InsetCardHeader className="pb-1.5">
        <InsetCardTitle>{t("common:page.dashboard.supervisionLabel")}</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className="border-l-[3px] border-l-primary bg-card p-3">
        <blockquote className="space-y-1.5">
          <p className="text-sm leading-relaxed text-foreground">
            &ldquo;{supervision.note}&rdquo;
          </p>
          <p className="text-xs text-muted-foreground">
            &mdash; {supervision.authorLabel}
          </p>
        </blockquote>
      </InsetCardContent>
    </InsetCard>
  )
}