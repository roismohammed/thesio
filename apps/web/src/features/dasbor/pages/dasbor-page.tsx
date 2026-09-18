import { useTranslation } from "react-i18next"

import { AppLayout } from "@/components/layout/app-layout"
import { useSeoMeta } from "@/hooks/use-seo-meta"
import { ChapterProgressList } from "@/features/dasbor/components/chapter-progress-list"
import { KpiRow } from "@/features/dasbor/components/kpi-row"
import { MotivationalQuote } from "@/features/dasbor/components/motivational-quote"
import { PriorityTasks } from "@/features/dasbor/components/priority-tasks"
import { ProgressRing } from "@/features/dasbor/components/progress-ring"
import { StageStepper } from "@/features/dasbor/components/stage-stepper"
import { SupervisionNote } from "@/features/dasbor/components/supervision-note"
import { WritingTrendChart } from "@/features/dasbor/components/writing-trend-chart"
import { useDashboard } from "@/features/dasbor/hooks/use-dashboard"

export function DasborPage() {
  const { t } = useTranslation()
  const dashboard = t("breadcrumb.dashboard")
  const { data } = useDashboard()

  useSeoMeta({
    title: t("seo.pages.dashboard.title"),
    description: t("seo.pages.dashboard.description"),
    path: "/",
  })

  return (
    <AppLayout pageTitle={dashboard} breadcrumb={[{ title: dashboard }]}>
      <div className="flex flex-col gap-5 pb-4">
        <HeroSection data={data} />
        <StageStepper stages={data.stages} />
        <KpiRow kpi={data.kpi} />
        <div className="grid gap-3.5 lg:grid-cols-[1.4fr_1fr]">
          <WritingTrendChart
            data={data.weeklyWords}
            wordsTarget={data.wordsTarget}
            totalWords={data.kpi.wordsWritten}
          />
          <ChapterProgressList chapters={data.chapters} />
        </div>
        <div className="grid gap-3.5 lg:grid-cols-[1.4fr_1fr]">
          <PriorityTasks tasks={data.tasks} />
          <SupervisionNote supervision={data.supervision} />
        </div>
        <MotivationalQuote quote={data.quote} />
      </div>
    </AppLayout>
  )
}

function HeroSection({
  data,
}: {
  data: ReturnType<typeof useDashboard>["data"]
}) {
  const { t } = useTranslation()

  return (
    <section className="flex flex-wrap items-center justify-between gap-6 opacity-100 transition-[opacity,translate] duration-500 ease-[var(--ease-out)] motion-reduce:transition-none @starting-style:[opacity:0;translate:_0_8px]">
      <div className="min-w-0 flex-1">
        <p className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {formatToday()}
        </p>
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl [text-wrap:balance]">
          {t("common:page.dashboard.greeting", { name: data.greetingName })}{" "}
          <span className="font-semibold text-primary">
            {t("common:page.dashboard.progressHeadline", {
              value: data.progressPercent,
            })}
          </span>
        </h1>
        <p className="mt-2 max-w-[50ch] text-sm leading-relaxed text-muted-foreground">
          &ldquo;{data.thesisTitle}&rdquo;
        </p>
      </div>
      <ProgressRing
        percent={data.progressPercent}
        label={t("common:page.dashboard.skripsiSelesai")}
      />
    </section>
  )
}

function formatToday(): string {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]
  const now = new Date()
  return `${days[now.getDay()]} · ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`
}