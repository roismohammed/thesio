import { useTranslation } from "react-i18next"
import { PlusIcon, SparklesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BoardToolbarProps {
  filter: "all" | "late" | "soon"
  sortBy: "priority" | "due_at"
  onFilterChange: (filter: "all" | "late" | "soon") => void
  onSortChange: (sortBy: "priority" | "due_at") => void
  onNewTask: () => void
  onAskSuggestion: () => void
  suggestionsLoading?: boolean
  shortcutHelp?: React.ReactNode
}

/**
 * Sticky board toolbar: "Buat Tugas", "Minta Saran", urgency filter, and a
 * sort toggle. Shortcut hints rendered with Kbd. The suggestion button is
 * wired in US3 but present from US2 (MVP board).
 */
export function BoardToolbar({
  filter,
  sortBy,
  onFilterChange,
  onSortChange,
  onNewTask,
  onAskSuggestion,
  suggestionsLoading,
  shortcutHelp,
}: BoardToolbarProps) {
  const { t } = useTranslation("thesis")

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background/90 py-2 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={onNewTask}>
          <PlusIcon className="size-4" />
          {t("kanban.newTask")}
        </Button>
        <Button variant="outline" onClick={onAskSuggestion} disabled={suggestionsLoading}>
          <SparklesIcon className="size-4" />
          {suggestionsLoading ? t("kanban.generatingSuggestion") : t("kanban.askSuggestion")}
        </Button>
        <Select
          value={filter}
          onValueChange={(value) => onFilterChange(value as "all" | "late" | "soon")}
        >
          <SelectTrigger className="w-44" aria-label={t("kanban.filter.all")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("kanban.filter.all")}</SelectItem>
            <SelectItem value="late">{t("kanban.filter.late")}</SelectItem>
            <SelectItem value="soon">{t("kanban.filter.soon")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as "priority" | "due_at")}>
          <SelectTrigger className="w-44" aria-label={t("kanban.filter.sortPriority")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">{t("kanban.filter.sortPriority")}</SelectItem>
            <SelectItem value="due_at">{t("kanban.filter.sortDueDate")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <span className="hidden items-center gap-1 md:flex">
          <Kbd>n</Kbd> {t("kanban.shortcuts.newTask")}
          <span className="mx-1">·</span>
          <Kbd>s</Kbd> {t("kanban.shortcuts.askSuggestion")}
        </span>
        {shortcutHelp}
      </div>
    </div>
  )
}