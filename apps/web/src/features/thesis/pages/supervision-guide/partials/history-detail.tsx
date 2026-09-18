import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import type { SupervisionGuide } from "@/features/thesis/types"
import { GuidancePointItem } from "@/features/thesis/pages/supervision-guide/partials/guidance-point-item"

interface HistoryDetailProps {
  guide: SupervisionGuide
  onBack: () => void
  onTogglePrepared: () => void
  onRemove: () => void
}

/**
 * Read-only view of a past agenda: points with their point-in-time statuses
 * and source links.
 */
export function HistoryDetail({ guide, onBack }: HistoryDetailProps) {
  const { t } = useTranslation("thesis")

  return (
    <div className="flex flex-col gap-3">
      <Button variant="ghost" size="sm" onClick={onBack}>
        {t("guidance.backToHistory")}
      </Button>
      <div className="flex flex-col gap-2">
        {guide.points.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t("guidance.noPoints")}</p>
        ) : (
          guide.points.map((point) => <GuidancePointItem key={point.id} point={point} readOnly />)
        )}
      </div>
    </div>
  )
}