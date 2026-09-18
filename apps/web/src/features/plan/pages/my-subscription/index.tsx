import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  Clock01Icon,
  Invoice02Icon,
  Shield02Icon,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import { api, ApiError, getCachedApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

export interface PlanDetail {
  id: number
  name: string
  description: string | null
  price: number
  permissions: { id: number; name: string }[]
}

export interface UserSubscription {
  id: number
  type: "trial" | "paid"
  status: "active" | "expired"
  starts_at: string
  ends_at: string
  plan: PlanDetail | null
}

export interface UserPayment {
  id: number
  amount: number
  status: "pending" | "paid" | "expired" | "failed"
  merchant_order_id: string
  payment_method: string | null
  paid_at: string | null
  created_at: string
  plan: { id: number; name: string } | null
}

interface MySubscriptionResponse {
  data: {
    current: UserSubscription | null
    payments: UserPayment[]
  }
}

export function MySubscriptionPage() {
  const { t } = useTranslation()
  const { refresh: refreshAuth } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const mockPaymentId = searchParams.get("mock_payment")

  const cachedData = getCachedApi<MySubscriptionResponse>("/api/my/subscription")
  const [subscription, setSubscription] = useState<UserSubscription | null>(() => cachedData?.data.current ?? null)
  const [payments, setPayments] = useState<UserPayment[]>(() => cachedData?.data.payments ?? [])
  const [loading, setLoading] = useState(() => !cachedData)
  const [payingId, setPayingId] = useState<number | null>(null)

  async function load() {
    try {
      const payload = await api<{
        data: {
          current: UserSubscription | null
          payments: UserPayment[]
        }
      }>("/api/my/subscription")
      setSubscription(payload.data.current)
      setPayments(payload.data.payments)
    } catch (err) {
      toast.add({
        title: err instanceof ApiError ? err.message : "Gagal memuat informasi langganan",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  // Auto clean query param if already paid
  useEffect(() => {
    if (mockPaymentId && payments.length > 0) {
      const matched = payments.find((p) => String(p.id) === mockPaymentId)
      if (matched && matched.status === "paid") {
        const next = new URLSearchParams(searchParams)
        next.delete("mock_payment")
        setSearchParams(next, { replace: true })
      }
    }
  }, [mockPaymentId, payments, searchParams, setSearchParams])

  async function handleMockPay(paymentId: number) {
    setPayingId(paymentId)
    try {
      const payload = await api<{ message: string }>(`/api/payments/${paymentId}/mock-pay`, {
        method: "POST",
      })
      toast.add({
        title: payload.message || "Pembayaran berhasil dikonfirmasi!",
        type: "success",
      })
      const next = new URLSearchParams(searchParams)
      next.delete("mock_payment")
      setSearchParams(next, { replace: true })
      await Promise.all([load(), refreshAuth()])
    } catch (err) {
      toast.add({
        title: err instanceof ApiError ? err.message : "Gagal memproses pembayaran simulasi",
        type: "error",
      })
    } finally {
      setPayingId(null)
    }
  }

  const pendingMockPayment = mockPaymentId
    ? payments.find((p) => String(p.id) === mockPaymentId && p.status === "pending")
    : null

  function formatDate(iso: string | null) {
    if (!iso) return "-"
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  function getDaysRemaining(endsAt: string) {
    const end = new Date(endsAt).getTime()
    const now = new Date().getTime()
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  return (
    <AppLayout
      pageTitle="Langganan Saya"
      breadcrumb={[
        { title: t("breadcrumb.dashboard"), url: "/" },
        { title: "Langganan Saya" },
      ]}
    >
      <div className="flex flex-col gap-6 w-full">
        {/* Header Title & Action */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Status & Paket Langganan
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Kelola paket aktif, pantau sisa masa berlaku fitur skripsi, dan tinjau riwayat tagihan.
            </p>
          </div>
          <Button render={<Link to="/plans" />} size="sm" className="gap-2">
            <HugeiconsIcon icon={Invoice02Icon} strokeWidth={2} className="size-4" />
            <span>Lihat Semua Pilihan Paket</span>
          </Button>
        </div>

        {/* Mock Payment Action Banner */}
        {pendingMockPayment && (
          <InsetCard className="border-amber-500/40 bg-amber-500/5 w-full">
            <InsetCardHeader className="pb-2">
              <InsetCardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <HugeiconsIcon icon={Invoice02Icon} strokeWidth={2} className="size-5" />
                Selesaikan Pembayaran (Simulasi Midtrans)
              </InsetCardTitle>
            </InsetCardHeader>
            <InsetCardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="text-sm font-semibold text-foreground">
                  {pendingMockPayment.plan?.name ?? "Paket Langganan"} — Rp {pendingMockPayment.amount.toLocaleString("id-ID")}
                </div>
                <p className="text-xs text-muted-foreground">
                  Order ID: <span className="font-mono font-medium">{pendingMockPayment.merchant_order_id}</span>. Transaksi sedang menunggu konfirmasi pembayaran.
                </p>
              </div>
              <Button
                onClick={() => void handleMockPay(pendingMockPayment.id)}
                disabled={payingId === pendingMockPayment.id}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4" />
                {payingId === pendingMockPayment.id ? "Memproses..." : "Bayar Sekarang (Simulasi Lunas)"}
              </Button>
            </InsetCardContent>
          </InsetCard>
        )}

        {/* Active Subscription Banner */}
        <InsetCard className="w-full">
          <InsetCardHeader className="flex items-center justify-between">
            <InsetCardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Shield02Icon} strokeWidth={2} className="size-4 text-primary" />
              <span>Paket Langganan Aktif</span>
            </InsetCardTitle>
            {subscription && (
              <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                Aktif
              </Badge>
            )}
          </InsetCardHeader>
          <InsetCardContent>
            {loading ? (
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-2">
                <div className="space-y-3 max-w-xl w-full">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-5/6" />
                  <div className="flex items-center gap-4 pt-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="flex flex-col gap-2 rounded-xl border border-border/70 p-4 bg-muted/30 lg:min-w-80">
                  <Skeleton className="h-4 w-36" />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <Skeleton className="h-6 w-20 rounded-md" />
                    <Skeleton className="h-6 w-24 rounded-md" />
                    <Skeleton className="h-6 w-28 rounded-md" />
                  </div>
                </div>
              </div>
            ) : subscription ? (
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xl sm:text-2xl font-bold text-foreground">
                      {subscription.plan?.name ?? "Paket Aktif"}
                    </span>
                    <Badge variant={subscription.type === "trial" ? "secondary" : "default"}>
                      {subscription.type === "trial" ? "Masa Percobaan" : "Paket Berbayar"}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {subscription.plan?.description ??
                      "Akses modul terstruktur untuk menyusun skripsi mandiri."}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="size-3.5 text-primary" />
                      Berlaku sampai:{" "}
                      <strong className="text-foreground">{formatDate(subscription.ends_at)}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Sisa masa aktif:{" "}
                      <strong className="text-foreground font-mono">
                        {getDaysRemaining(subscription.ends_at)} hari
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Permissions tag cloud */}
                <div className="flex flex-col gap-2 rounded-xl border border-border/70 p-4 bg-muted/30 lg:min-w-80">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-3.5 text-primary" />
                    Modul yang Terbuka:
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {subscription.plan?.permissions && subscription.plan.permissions.length > 0 ? (
                      subscription.plan.permissions.map((p) => (
                        <span
                          key={p.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-background border border-border/60 text-xs font-medium text-foreground"
                        >
                          <HugeiconsIcon
                            icon={CheckmarkCircle02Icon}
                            strokeWidth={2}
                            className="size-3 text-emerald-600 shrink-0"
                          />
                          <span>{p.name}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">Akses standar skripsi.</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                <div className="size-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
                  <HugeiconsIcon icon={Shield02Icon} strokeWidth={2} className="size-6 text-muted-foreground/60" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">Belum Ada Paket Aktif</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Pilih paket langganan untuk membuka akses lengkap pengerjaan naskah, bimbingan, dan kanban.
                  </p>
                </div>
                <Button render={<Link to="/plans" />} size="sm" className="mt-2">
                  Pilih Paket Sekarang
                </Button>
              </div>
            )}
          </InsetCardContent>
        </InsetCard>

        {/* Payment History Card */}
        <InsetCard className="w-full">
          <InsetCardHeader className="flex items-center justify-between">
            <InsetCardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Invoice02Icon} strokeWidth={2} className="size-4 text-primary" />
              <span>Riwayat Transaksi & Pembayaran</span>
            </InsetCardTitle>
          </InsetCardHeader>
          <InsetCardContent className="p-0 overflow-hidden gap-0">
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode Referensi</TableHead>
                    <TableHead>Paket</TableHead>
                    <TableHead>Nominal</TableHead>
                    <TableHead>Status Pembayaran</TableHead>
                    <TableHead>Tanggal Transaksi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={`skeleton-${i}`}>
                        <TableCell className="py-3"><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell className="py-3"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="py-3"><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="py-3"><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="py-3"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="py-3 text-right"><Skeleton className="h-6 w-16 ml-auto rounded-md" /></TableCell>
                      </TableRow>
                    ))
                  ) : payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-10 text-xs">
                        Belum ada riwayat transaksi pembayaran.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs font-semibold">{p.merchant_order_id}</TableCell>
                        <TableCell className="font-medium text-xs">{p.plan?.name ?? "-"}</TableCell>
                        <TableCell className="font-semibold text-xs whitespace-nowrap font-mono">
                          Rp {p.amount.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell>
                          {p.status === "paid" && (
                            <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-[11px]">
                              Lunas
                            </Badge>
                          )}
                          {p.status === "pending" && (
                            <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 text-[11px]">
                              Menunggu Pembayaran
                            </Badge>
                          )}
                          {p.status === "failed" && (
                            <Badge variant="destructive" className="text-[11px]">
                              Gagal
                            </Badge>
                          )}
                          {p.status === "expired" && (
                            <Badge variant="secondary" className="text-[11px]">
                              Kedaluwarsa
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(p.paid_at || p.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          {p.status === "pending" ? (
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => void handleMockPay(p.id)}
                              disabled={payingId === p.id}
                            >
                              {payingId === p.id ? "Memproses..." : "Bayar"}
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </InsetCardContent>
        </InsetCard>
      </div>
    </AppLayout>
  )
}
