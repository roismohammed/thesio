import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { SupervisionGuideListItem } from "@/features/thesis/types"

interface HistoryListProps {
  history: SupervisionGuideListItem[]
  onSelect: (guideId: number) => void
}

/**
 * List of past agendas with generation date, origin, and point counts.
 */
export function HistoryList({ history, onSelect }: HistoryListProps) {
  const { t } = useTranslation("thesis")

  if (history.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className="text-muted-foreground text-sm">{t("guidance.historyEmpty")}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="font-medium">{t("guidance.historyTitle")}</p>
      <div className="flex flex-col gap-2">
        {history.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm">
                  {t("guidance.generatedAt", { date: new Date(item.generated_at).toLocaleString() })}
                </span>
                <Badge variant={item.origin === "scheduled" ? "outline" : "secondary"}>
                  {item.origin === "scheduled" ? t("guidance.originScheduled") : t("guidance.originOnDemand")}
                </Badge>
                {item.status === "current" ? <Badge>{t("guidance.historyCurrent")}</Badge> : null}
                <span className="text-muted-foreground text-xs tabular-nums">
                  {t("guidance.pointsCount", { count: item.points_count })} ·{" "}
                  {t("guidance.preparedCount", { count: item.prepared_count })}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onSelect(item.id)}>
                {t("guidance.viewGuide")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}