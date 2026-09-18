import { useTranslation } from "react-i18next"

import {
  InsetCard,
  InsetCardContent,
  InsetCardHeader,
  InsetCardTitle,
} from "@/components/ui/inset-card"
import type { DashboardChapter } from "@/features/dasbor/types"
import { cn } from "@/lib/utils"

interface ChapterProgressListProps {
  chapters: DashboardChapter[]
}

const barColor: Record<DashboardChapter["state"], string> = {
  done: "bg-success",
  now: "bg-primary",
  todo: "bg-transparent",
}

export function ChapterProgressList({ chapters }: ChapterProgressListProps) {
  const { t } = useTranslation()

  return (
    <InsetCard>
      <InsetCardHeader className="flex items-center justify-between pb-1.5">
        <InsetCardTitle>{t("common:page.dashboard.chapterStatusTitle")}</InsetCardTitle>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          {t("common:page.dashboard.chapterStatusHint", {
            count: chapters.length,
          })}
        </span>
      </InsetCardHeader>
      <InsetCardContent className="gap-2.5 p-3">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="grid grid-cols-[1fr_auto] gap-1">
            <div className="text-[13px] font-semibold">
              <span className="mr-2 font-mono text-[11px] font-medium text-muted-foreground">
                {chapter.number}
              </span>
              {chapter.title}
            </div>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {chapter.percent}%
            </span>
            <div className="col-span-full h-2 overflow-hidden rounded-full border border-border bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-700 ease-[var(--ease-in-out)] motion-reduce:transition-none",
                  barColor[chapter.state]
                )}
                style={{ width: `${chapter.percent}%` }}
              />
            </div>
          </div>
        ))}
      </InsetCardContent>
    </InsetCard>
  )
}