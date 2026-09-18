import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface GuideEmptyStateProps {
  hasChapters: boolean
  deadlineNotSet: boolean
  hasGuide: boolean
  generating: boolean
  onGenerate: () => void
}

/**
 * Friendly empty states for the guidance page: no current guide (on-demand
 * CTA), no chapters yet, no points, or missing deadline nudges.
 */
export function GuideEmptyState({ hasChapters, deadlineNotSet, hasGuide, generating, onGenerate }: GuideEmptyStateProps) {
  const { t } = useTranslation("thesis")

  if (!hasChapters) {
    return (
      <Card>
        <CardContent className="flex flex-col items-start gap-3">
          <p className="text-muted-foreground text-sm">{t("guidance.noChapters")}</p>
        </CardContent>
      </Card>
    )
  }

  if (!hasGuide) {
    return (
      <Card>
        <CardContent className="flex flex-col items-start gap-3">
          <p className="text-muted-foreground text-sm">{t("guidance.noGuide")}</p>
          {deadlineNotSet ? (
            <p className="text-muted-foreground text-xs">{t("guidance.deadlineNotSet")}</p>
          ) : null}
          <Button onClick={onGenerate} disabled={generating}>
            {generating ? t("guidance.generating") : t("guidance.generate")}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return null
}