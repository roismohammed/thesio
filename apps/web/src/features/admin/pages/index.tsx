import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { HugeiconsIcon } from "@hugeicons/react"
import { RefreshIcon } from "@hugeicons/core-free-icons"

import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { ProgressRing } from "@/features/dasbor/components/progress-ring"
import { api, getCachedApi } from "@/lib/api"
import { AdminMetricsRow } from "./partials/admin-metrics-row"
import { AdminRevenueChart } from "./partials/admin-revenue-chart"
import { AdminPlanDistribution } from "./partials/admin-plan-distribution"
import { AdminRecentTransactions } from "./partials/admin-recent-transactions"
import { AdminQuickLinks } from "./partials/admin-quick-links"
import type { AdminDashboardData, AdminDashboardResponse } from "./types"

export function AdminPage() {
  const { t } = useTranslation()
  const cached = getCachedApi<AdminDashboardResponse>("/api/admin")
  const [data, setData] = useState<AdminDashboardData | null>(() => cached?.data ?? null)
  const [loading, setLoading] = useState<boolean>(() => !cached)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setError(null)
    try {
      const res = await api<AdminDashboardResponse>("/api/admin")
      setData(res.data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data dasbor admin"
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const paidRatio =
    data && data.active_subscriptions_count > 0
      ? Math.round((data.paid_subscriptions_count / data.active_subscriptions_count) * 100)
      : 0

  return (
    <AppLayout
      pageTitle="Dasbor Administrasi SaaS"
      breadcrumb={[
        { title: t("breadcrumb.dashboard"), url: "/" },
        { title: "Administrasi" },
      ]}
    >
      <div className="flex flex-col gap-5 pb-4">
        <section className="flex flex-wrap items-center justify-between gap-6 opacity-100 transition-[opacity,translate] duration-500 ease-[var(--ease-out)] motion-reduce:transition-none @starting-style:[opacity:0;translate:_0_8px]">
          <div className="min-w-0 flex-1">
            <p className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {formatToday()}
            </p>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl [text-wrap:balance]">
              Dasbor Administrasi SaaS{" "}
              <span className="font-semibold text-primary">
                ({data?.paid_subscriptions_count ?? 0} Langganan Berbayar)
              </span>
            </h1>
            <p className="mt-2 max-w-[55ch] text-sm leading-relaxed text-muted-foreground">
              Pantau performa pendapatan, langganan aktif, dan seluruh progres pengerjaan skripsi mahasiswa.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ProgressRing
              percent={paidRatio}
              label="Konversi Berbayar"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="gap-1.5 transition-transform duration-150 active:scale-[0.97] self-start sm:self-center"
            >
              <HugeiconsIcon
                icon={RefreshIcon}
                size={14}
                className={loading ? "animate-spin" : ""}
              />
              Segarkan
            </Button>
          </div>
        </section>

        {error && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive flex items-center justify-between rounded-lg border p-4 text-sm">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="bg-background text-foreground h-7 px-2.5 text-xs"
            >
              Coba Lagi
            </Button>
          </div>
        )}

        <AdminMetricsRow data={data} loading={loading} />

        <AdminRevenueChart
          data={data?.monthly_data ?? []}
          loading={loading}
        />

        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1fr_1.5fr]">
          <AdminPlanDistribution
            data={data?.plan_breakdown ?? []}
            loading={loading}
          />
          <AdminRecentTransactions
            data={data?.recent_transactions ?? []}
            loading={loading}
          />
        </div>

        <AdminQuickLinks />
      </div>
    </AppLayout>
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
