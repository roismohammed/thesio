import { useTranslation } from "react-i18next"

import type { TaskSuggestion } from "@/features/thesis/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface SuggestionCardProps {
  suggestion: TaskSuggestion
  onAccept: (suggestionId: number) => void
  onReject: (suggestionId: number) => void
  actionPending?: boolean
}

/**
 * Single suggestion card: source badge, due-date suggestion, priority, and
 * accept/reject actions.
 */
export function SuggestionCard({ suggestion, onAccept, onReject, actionPending }: SuggestionCardProps) {
  const { t } = useTranslation("thesis")

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">{suggestion.title}</p>
          {suggestion.description ? (
            <p className="text-muted-foreground line-clamp-2 text-xs">{suggestion.description}</p>
          ) : null}
        </div>
        <Badge variant="outline" className="shrink-0 text-xs">
          {suggestion.source_type === "note_revision"
            ? t("kanban.suggestion.sourceNote")
            : t("kanban.suggestion.sourceChapter")}
        </Badge>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground font-mono text-xs tabular-nums">
          {suggestion.due_at_suggestion
            ? t("kanban.deadline", {
                date: new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
                  new Date(suggestion.due_at_suggestion),
                ),
              })
            : t("kanban.noDue")}
        </span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onReject(suggestion.id)} disabled={actionPending}>
            {t("kanban.suggestion.reject")}
          </Button>
          <Button size="sm" onClick={() => onAccept(suggestion.id)} disabled={actionPending}>
            {t("kanban.suggestion.accept")}
          </Button>
        </div>
      </div>
    </div>
  )
}