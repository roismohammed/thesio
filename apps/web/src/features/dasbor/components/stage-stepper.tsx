import type { DashboardStage, StageState } from "@/features/dasbor/types"
import { cn } from "@/lib/utils"

interface StageStepperProps {
  stages: DashboardStage[]
}

const stateTextClass: Record<StageState, string> = {
  done: "text-success",
  now: "text-primary",
  todo: "text-muted-foreground",
}

export function StageStepper({ stages }: StageStepperProps) {
  return (
    <div
      role="list"
      className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-card ring-1 ring-foreground/5 sm:grid-cols-4"
    >
      {stages.map((stage, index) => {
        const isNow = stage.state === "now"
        return (
          <div
            key={stage.id}
            role="listitem"
            className={cn(
              "relative border-b border-border p-4 sm:border-b-0",
              index % 2 === 1 && "border-l-0 sm:border-l",
              index < 2 && "sm:border-b-0",
              index >= 2 && "border-t border-l sm:border-t-0",
              index % 2 === 0 && index >= 2 && "sm:border-l",
              isNow && "bg-muted/40"
            )}
          >
            {isNow && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-0.5 bg-primary"
              />
            )}
            <span className="font-mono text-xs text-muted-foreground">
              {stage.number}
            </span>
            <div className="mt-1 text-sm font-semibold text-foreground">
              {stage.name}
            </div>
            <div
              className={cn(
                "mt-1.5 flex items-center gap-1.5 text-xs font-medium",
                stateTextClass[stage.state]
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "size-1.5 rounded-full bg-current",
                  isNow && "ring-[3px] ring-primary/20 motion-safe:animate-pulse"
                )}
              />
              {stage.detail}
            </div>
          </div>
        )
      })}
    </div>
  )
}