import { useState } from "react"
import { useTranslation } from "react-i18next"

import {
  InsetCard,
  InsetCardContent,
  InsetCardHeader,
  InsetCardTitle,
} from "@/components/ui/inset-card"
import { Checkbox } from "@/components/ui/checkbox"
import type { DashboardTask } from "@/features/dasbor/types"
import { cn } from "@/lib/utils"

interface PriorityTasksProps {
  tasks: DashboardTask[]
}

const tagClass: Record<DashboardTask["tag"], string> = {
  today: "bg-destructive/10 text-destructive",
  revision: "bg-primary/10 text-primary",
  draft: "bg-muted text-muted-foreground",
}

export function PriorityTasks({ tasks }: PriorityTasksProps) {
  const { t } = useTranslation()
  const [done, setDone] = useState<Record<string, boolean>>({})

  return (
    <InsetCard>
      <InsetCardHeader className="flex items-center justify-between pb-1.5">
        <InsetCardTitle>{t("common:page.dashboard.tasksTitle")}</InsetCardTitle>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          {t("common:page.dashboard.tasksHint", { count: tasks.length })}
        </span>
      </InsetCardHeader>
      <InsetCardContent className="gap-2 p-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-2.5 rounded-lg border border-border p-2.5 transition-transform duration-100 active:scale-[0.99] motion-reduce:transition-none"
          >
            <Checkbox
              checked={!!done[task.id]}
              onCheckedChange={(checked) =>
                setDone((prev) => ({ ...prev, [task.id]: !!checked }))
              }
              aria-label={task.title}
              className="mt-0.5"
            />
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  "text-sm font-semibold leading-snug transition-colors duration-150",
                  done[task.id] && "text-muted-foreground line-through"
                )}
              >
                {task.title}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {task.meta}
              </div>
            </div>
            <span
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.06em] rounded-full px-2 py-0.5 font-medium",
                tagClass[task.tag]
              )}
            >
              {t(`common:page.dashboard.taskTag${task.tag.charAt(0).toUpperCase()}${task.tag.slice(1)}`)}
            </span>
          </div>
        ))}
      </InsetCardContent>
    </InsetCard>
  )
}