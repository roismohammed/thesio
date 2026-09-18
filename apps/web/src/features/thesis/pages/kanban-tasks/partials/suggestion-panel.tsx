import { useTranslation } from "react-i18next"

import type { TaskSuggestion } from "@/features/thesis/types"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { SuggestionCard } from "./suggestion-card"

interface SuggestionPanelProps {
  suggestions: TaskSuggestion[]
  loading: boolean
  generating: boolean
  onAccept: (suggestionId: number) => void
  onReject: (suggestionId: number) => void
}

/**
 * Collapsible suggestion panel listing AI-derived tasks sorted by priority,
 * with an empty state and a generating skeleton.
 */
export function SuggestionPanel({ suggestions, loading, generating, onAccept, onReject }: SuggestionPanelProps) {
  const { t } = useTranslation("thesis")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("kanban.suggestion.title")}</CardTitle>
      </CardHeader>
      <div className="flex max-h-80 flex-col gap-2 overflow-y-auto px-4 pb-4">
        {loading || generating ? (
          <div className="grid gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : null}

        {!loading && !generating && suggestions.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t("kanban.suggestion.empty")}</p>
        ) : null}

        {!loading && suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onAccept={onAccept}
            onReject={onReject}
            actionPending={generating}
          />
        ))}
      </div>
    </Card>
  )
}