import { Link } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, Invoice02Icon } from "@hugeicons/core-free-icons"

import {
  InsetCard,
  InsetCardContent,
  InsetCardHeader,
  InsetCardTitle,
} from "@/components/ui/inset-card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import type { PlanBreakdownItem } from "../types"

interface AdminPlanDistributionProps {
  data: PlanBreakdownItem[]
  loading: boolean
}

const formatIdr = (val: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val)

export function AdminPlanDistribution({
  data,
  loading,
}: AdminPlanDistributionProps) {
  if (loading) {
    return (
      <InsetCard>
        <InsetCardHeader className="flex items-center justify-between pb-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-20" />
        </InsetCardHeader>
        <InsetCardContent className="space-y-3 p-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </InsetCardContent>
      </InsetCard>
    )
  }

  const totalActiveUsers = data.reduce(
    (acc, plan) => acc + plan.active_users_count,
    0
  )

  return (
    <InsetCard>
      <InsetCardHeader className="flex items-center justify-between pb-1.5">
        <InsetCardTitle>Distribusi Paket</InsetCardTitle>
        <Link
          to="/admin/plans"
          className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground inline-flex items-center gap-0.5"
        >
          Kelola Paket
          <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
        </Link>
      </InsetCardHeader>
      <InsetCardContent className="gap-2.5 p-3">
        {data.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Belum ada paket langganan aktif
          </div>
        ) : (
          data.map((plan) => {
            const userPercentage =
              totalActiveUsers > 0
                ? Math.round((plan.active_users_count / totalActiveUsers) * 100)
                : 0

            return (
              <div
                key={plan.id}
                className="rounded-lg border border-border bg-card p-2.5 transition-transform duration-100 active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex size-7 flex-none items-center justify-center rounded-md bg-muted text-primary">
                      <HugeiconsIcon
                        icon={Invoice02Icon}
                        size={14}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-foreground truncate">
                        {plan.name}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground tabular-nums">
                        {plan.price === 0 ? "Gratis" : `${formatIdr(plan.price)}/bln`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-none">
                    <div className="text-xs font-semibold text-foreground tabular-nums">
                      {plan.active_users_count} Akun
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground tabular-nums">
                      {formatIdr(plan.total_revenue)}
                    </div>
                  </div>
                </div>
                <div className="mt-2.5">
                  <div className="mb-1 flex justify-between font-mono text-[10px] text-muted-foreground tabular-nums">
                    <span>Porsi Pengguna</span>
                    <span>{userPercentage}%</span>
                  </div>
                  <Progress value={userPercentage} className="h-1.5" />
                </div>
              </div>
            )
          })
        )}
      </InsetCardContent>
    </InsetCard>
  )
}
