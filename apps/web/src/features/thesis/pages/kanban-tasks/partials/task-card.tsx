import { useTranslation } from "react-i18next"
import { MoreHorizontalIcon } from "lucide-react"

import type { Task, TaskStatus } from "@/features/thesis/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
  onMove: (taskId: number, status: TaskStatus) => void
}

const URGENCY_TONE: Record<Task["urgency"], string> = {
  late: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  soon: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  safe: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  none: "text-muted-foreground",
}

const OTHER_STATUSES: TaskStatus[] = ["todo", "doing", "done"]

/**
 * A board card: title, description snippet, formatted due date, urgency
 * indicator, and a "..." popover with quick actions (edit / move / delete).
 */
export function TaskCard({ task, onEdit, onDelete, onMove }: TaskCardProps) {
  const { t } = useTranslation("thesis")
  const canDisplayDue = task.due_at !== null && task.due_at !== undefined

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-3 shadow-sm transition-shadow hover:shadow-md dark:bg-card/60">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <p className="text-sm leading-snug font-medium">{task.title}</p>
          {task.description ? (
            <p className="text-muted-foreground line-clamp-2 text-xs">{task.description}</p>
          ) : null}
        </div>

        <Popover>
          <PopoverTrigger render={<Button variant="ghost" size="icon" className="size-7 shrink-0" />}>
            <MoreHorizontalIcon className="size-4" />
            <span className="sr-only">{t("kanban.edit")}</span>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48 p-1">
            <div className="grid gap-0.5">
              <Button variant="ghost" size="sm" className="justify-start" onClick={() => onEdit(task)}>
                {t("kanban.edit")}
              </Button>
              {OTHER_STATUSES.filter((s) => s !== task.status).map((status) => (
                <Button
                  key={status}
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => onMove(task.id, status)}
                >
                  {t("kanban.moveTo")}: {t(`kanban.column${capitalize(status)}`)}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-destructive hover:text-destructive"
                onClick={() => onDelete(task.id)}
              >
                {t("kanban.delete")}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {canDisplayDue ? (
          <span className="text-muted-foreground font-mono text-xs tabular-nums">
            {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(task.due_at!))}
          </span>
        ) : null}
        <Badge variant="outline" className={cn("text-xs", URGENCY_TONE[task.urgency])}>
          {t(`kanban.urgency.${task.urgency}`)}
        </Badge>
      </div>
    </div>
  )
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}