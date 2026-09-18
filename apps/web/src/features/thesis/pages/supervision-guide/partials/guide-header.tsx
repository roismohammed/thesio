import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface GuideHeaderProps {
  deadlineRemainingDays?: number | null
  deadlineNotSet: boolean
  isUnread: boolean
  isTailored: boolean
  generating: boolean
  onGenerate: () => void
}

/**
 * Header for the guidance page: deadline-remaining badge, unread indicator,
 * and the generate/regenerate action.
 */
export function GuideHeader({
  deadlineRemainingDays,
  deadlineNotSet,
  isUnread,
  isTailored,
  generating,
  onGenerate,
}: GuideHeaderProps) {
  const { t } = useTranslation("thesis")

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {deadlineNotSet ? (
          <Badge variant="secondary">{t("guidance.deadlineNotSet")}</Badge>
        ) : (
          <Badge variant="outline">
            {t("guidance.deadlineRemaining", { days: deadlineRemainingDays ?? 0 })}
          </Badge>
        )}
        {isUnread ? <Badge>{t("guidance.unread")}</Badge> : null}
        {isTailored ? <Badge variant="secondary">{t("guidance.tailoredHint")}</Badge> : null}
      </div>
      <Button onClick={onGenerate} disabled={generating}>
        {generating ? t("guidance.generating") : isTailored ? t("guidance.regenerate") : t("guidance.generate")}
      </Button>
    </div>
  )
}