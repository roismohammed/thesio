import { KpiCard } from "@/features/dasbor/components/kpi-card"
import type { DashboardKpi } from "@/features/dasbor/types"

export function KpiRow({ kpi }: { kpi: DashboardKpi }) {
  const wordsLabel = `${kpi.wordsWritten.toLocaleString("id-ID")}/${kpi.wordsTarget.toLocaleString("id-ID")}`

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <KpiCard
        value={String(kpi.daysToDefense)}
        unit="hari"
        label="Menuju target sidang"
        sub={kpi.defenseDate}
      />
      <KpiCard
        value={String(kpi.chaptersFinal)}
        unit={`/${kpi.chaptersTotal}`}
        label="Bab sudah final"
        sub={kpi.chaptersRemainingLabel}
      />
      <KpiCard
        value={wordsLabel}
        label="Kata tertulis"
        sub={`${kpi.wordsPercent}% target`}
      />
      <KpiCard
        value={String(kpi.streakDays)}
        unit="hari"
        label="Streak nulis berturut"
        sub={kpi.streakLabel}
        highlight
      />
    </div>
  )
}