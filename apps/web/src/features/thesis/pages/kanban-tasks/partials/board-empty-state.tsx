import { useTranslation } from "react-i18next"

import { Card, CardContent } from "@/components/ui/card"

/**
 * Friendly empty board state inviting the student to create a task or ask
 * for AI suggestions.
 */
export function BoardEmptyState() {
  const { t } = useTranslation("thesis")

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
        <p className="font-medium">{t("kanban.emptyTitle")}</p>
        <p className="text-muted-foreground max-w-sm text-sm">{t("kanban.emptyDescription")}</p>
      </CardContent>
    </Card>
  )
}