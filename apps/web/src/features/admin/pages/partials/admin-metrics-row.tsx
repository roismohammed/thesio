import { HugeiconsIcon } from "@hugeicons/react"
import {
  Book02Icon,
  Coins01Icon,
  Invoice02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

import {
  InsetCard,
  InsetCardContent,
  InsetCardHeader,
  InsetCardTitle,
} from "@/components/ui/inset-card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { AdminDashboardData } from "../types"

interface AdminMetricsRowProps {
  data: AdminDashboardData | null
  loading: boolean
}

const formatIdr = (val: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val)

export function AdminMetricsRow({ data, loading }: AdminMetricsRowProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <InsetCard key={i} className="p-1.5">
            <InsetCardHeader className="px-1.5 pt-0.5 pb-1">
              <Skeleton className="h-3.5 w-24" />
            </InsetCardHeader>
            <InsetCardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1.5">
                  <Skeleton className="h-7 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="size-9 rounded-lg" />
              </div>
            </InsetCardContent>
          </InsetCard>
        ))}
      </div>
    )
  }

  const items = [
    {
      label: "MRR (Pendapatan Bulanan)",
      value: formatIdr(data.mrr),
      sub: `Total: ${formatIdr(data.total_revenue)}`,
      icon: Coins01Icon,
      iconStyle: "bg-primary/10 text-primary border-primary/20",
      highlight: true,
    },
    {
      label: "Langganan Aktif",
      value: data.active_subscriptions_count.toLocaleString("id-ID"),
      sub: `${data.paid_subscriptions_count} Berbayar · ${data.trial_subscriptions_count} Trial`,
      icon: Invoice02Icon,
      iconStyle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      label: "Total Mahasiswa",
      value: data.total_users_count.toLocaleString("id-ID"),
      sub: `+${data.new_users_this_month} bulan ini`,
      icon: UserGroupIcon,
      iconStyle: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    },
    {
      label: "Skripsi Mahasiswa",
      value: data.active_theses_count.toLocaleString("id-ID"),
      sub: `Dari ${data.total_theses_count} total skripsi`,
      icon: Book02Icon,
      iconStyle: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <InsetCard
          key={item.label}
          className="p-1.5 transition-shadow duration-150 hover:shadow-xs"
        >
          <InsetCardHeader className="px-1.5 pt-0.5 pb-1">
            <InsetCardTitle
              className="truncate text-[11px] font-semibold text-muted-foreground"
              title={item.label}
            >
              {item.label}
            </InsetCardTitle>
          </InsetCardHeader>
          <InsetCardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-2xl font-bold leading-none tracking-tight tabular-nums sm:text-3xl ${
                      item.highlight ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
                <p className="mt-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground/80 truncate" title={item.sub}>
                  {item.sub}
                </p>
              </div>
              <div
                className={cn(
                  "flex size-9 flex-none items-center justify-center rounded-lg border shadow-2xs",
                  item.iconStyle
                )}
              >
                <HugeiconsIcon icon={item.icon} size={18} strokeWidth={2} />
              </div>
            </div>
          </InsetCardContent>
        </InsetCard>
      ))}
    </div>
  )
}
