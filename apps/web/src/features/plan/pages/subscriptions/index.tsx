import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  Invoice02Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"

import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import {
  InsetCard,
  InsetCardContent,
  InsetCardHeader,
  InsetCardTitle,
} from "@/components/ui/inset-card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { api, ApiError, getCachedApi } from "@/lib/api"
import type { Plan } from "@/features/plan/types"

export function PlansPage() {
  const { t } = useTranslation()
  const [plans, setPlans] = useState<Plan[]>(() => {
    return getCachedApi<{ data: Plan[] }>("/api/plans")?.data ?? []
  })
  const [loading, setLoading] = useState(() => {
    return !getCachedApi<{ data: Plan[] }>("/api/plans")
  })
  const [subscribingId, setSubscribingId] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const payload = await api<{ data: Plan[] }>("/api/plans")
        setPlans(payload.data)
      } catch (err) {
        toast.add({
          title: err instanceof ApiError ? err.message : "Gagal memuat daftar paket",
          type: "error",
        })
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  async function handleSubscribe(plan: Plan) {
    setSubscribingId(plan.id)
    try {
      const response = await api<{
        message: string
        data: {
          payment: { id: number; merchant_order_id: string }
          redirect_url: string
        }
      }>("/api/subscriptions", {
        method: "POST",
        body: { plan_id: plan.id },
      })

      if (response.data.redirect_url) {
        window.location.href = response.data.redirect_url
      } else {
        toast.add({
          title: "Transaksi dibuat. Silakan selesaikan pembayaran.",
          type: "success",
        })
      }
    } catch (err) {
      toast.add({
        title: err instanceof ApiError ? err.message : "Gagal memproses langganan",
        type: "error",
      })
    } finally {
      setSubscribingId(null)
    }
  }

  return (
    <AppLayout
      pageTitle="Pilihan Paket Langganan"
      breadcrumb={[
        { title: t("breadcrumb.dashboard"), url: "/" },
        { title: "Langganan", url: "/my-subscription" },
        { title: "Pilihan Paket" },
      ]}
    >
      <div className="flex flex-col gap-6 w-full">
        {/* Header Section */}
        <div className="space-y-1.5 border-b border-border/60 pb-4">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Pilihan Paket Langganan Thesio
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Pilih paket yang paling sesuai dengan kebutuhan bimbingan dan penyusunan naskah skripsi Anda.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full items-stretch">
            {Array.from({ length: 3 }).map((_, i) => (
              <InsetCard key={`plan-skel-${i}`} className="flex flex-col justify-between border-border/80">
                <InsetCardHeader className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/5" />
                </InsetCardHeader>
                <InsetCardContent className="flex flex-col gap-5 justify-between flex-1">
                  <div className="flex flex-col gap-4">
                    <Skeleton className="h-8 w-36" />
                    <div className="border-t border-border/60 pt-4 space-y-2.5">
                      <Skeleton className="h-3.5 w-32" />
                      <div className="space-y-2">
                        <Skeleton className="h-3.5 w-full" />
                        <Skeleton className="h-3.5 w-4/5" />
                        <Skeleton className="h-3.5 w-3/4" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-9 w-full rounded-md mt-3" />
                </InsetCardContent>
              </InsetCard>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            Belum ada paket langganan aktif yang tersedia.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full items-stretch">
            {plans.map((plan) => {
              const isPopular = plan.price >= 80000 && plan.price < 120000
              const isUltimate = plan.price >= 120000

              return (
                <InsetCard
                  key={plan.id}
                  className={`flex flex-col justify-between transition-all duration-200 ${
                    isUltimate ? "border-primary/50 shadow-sm" : "border-border/80"
                  }`}
                >
                  <InsetCardHeader className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <InsetCardTitle className="text-base sm:text-lg font-bold">
                        {plan.name}
                      </InsetCardTitle>
                      {isUltimate && (
                        <Badge variant="default" className="gap-1 text-[10px]">
                          <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-3" />
                          Terlengkap
                        </Badge>
                      )}
                      {isPopular && <Badge variant="secondary" className="text-[10px]">Paling Populer</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground min-h-10 leading-relaxed">
                      {plan.description || "Akses modul skripsi pilihan."}
                    </p>
                  </InsetCardHeader>

                  <InsetCardContent className="flex flex-col gap-5 justify-between flex-1">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-baseline gap-1.5 pt-1">
                        <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
                          Rp {plan.price.toLocaleString("id-ID")}
                        </span>
                        <span className="text-xs text-muted-foreground">/ 30 hari</span>
                      </div>

                      <div className="border-t border-border/60 pt-4">
                        <span className="text-xs font-semibold text-foreground block mb-2.5">
                          Fitur & Modul Termasuk:
                        </span>
                        <ul className="flex flex-col gap-2 text-xs">
                          {plan.permissions.length === 0 ? (
                            <li className="text-muted-foreground">Akses standar skripsi.</li>
                          ) : (
                            plan.permissions.map((p) => (
                              <li key={p.id} className="flex items-center gap-2 text-foreground">
                                <HugeiconsIcon
                                  icon={CheckmarkCircle02Icon}
                                  strokeWidth={2}
                                  className="size-3.5 text-emerald-600 shrink-0"
                                />
                                <span>{p.name}</span>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </div>

                    <Button
                      onClick={() => void handleSubscribe(plan)}
                      disabled={subscribingId === plan.id}
                      variant={isUltimate ? "default" : "outline"}
                      className="w-full mt-3 font-semibold text-xs h-9 gap-1.5"
                    >
                      <HugeiconsIcon icon={Invoice02Icon} strokeWidth={2} className="size-4" />
                      {subscribingId === plan.id ? "Memproses…" : "Pilih Paket Ini"}
                    </Button>
                  </InsetCardContent>
                </InsetCard>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
