import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { GuidancePoint } from "@/features/thesis/types"

interface GuidancePointItemProps {
  point: GuidancePoint
  readOnly?: boolean
  onTogglePrepared?: () => void
  onRemove?: () => void
}

/**
 * A single guidance point row: title, description, source-link badge, origin
 * distinction, and a status pill. `readOnly` (history view) hides the action
 * controls.
 */
export function GuidancePointItem({ point, readOnly = false, onTogglePrepared, onRemove }: GuidancePointItemProps) {
  const { t } = useTranslation("thesis")

  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{point.title}</span>
            <Badge variant={point.origin === "student" ? "secondary" : "outline"}>
              {point.origin === "student" ? t("guidance.originStudent") : t("guidance.originSystem")}
            </Badge>
            <Badge variant={point.status === "prepared" ? "default" : "secondary"}>
              {point.status === "prepared" ? t("guidance.statusPrepared") : t("guidance.statusPending")}
            </Badge>
          </div>
          {!readOnly ? (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={onTogglePrepared}>
                {point.status === "prepared" ? t("guidance.unmarkPrepared") : t("guidance.markPrepared")}
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={onRemove}>
                {t("guidance.removePoint")}
              </Button>
            </div>
          ) : null}
        </div>
        {point.description ? (
          <p className="text-muted-foreground text-sm whitespace-pre-wrap">{point.description}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}