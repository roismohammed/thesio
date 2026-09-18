import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Invoice02Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { api, ApiError } from "@/lib/api"
import { toast } from "@/components/ui/toast"
import type { AdminUser } from "../types"

interface UserDetailResponse {
  data: {
    user: AdminUser
    active_subscription: {
      id: number
      type: "trial" | "paid"
      status: "active" | "expired"
      starts_at: string
      ends_at: string
      plan: {
        id: number
        name: string
        price: number
        permissions: { id: number; name: string }[]
      } | null
    } | null
    all_subscriptions: Array<{
      id: number
      type: "trial" | "paid"
      status: "active" | "expired"
      starts_at: string
      ends_at: string
      plan: { id: number; name: string } | null
    }>
    payments: Array<{
      id: number
      amount: number
      status: "pending" | "paid" | "expired" | "failed"
      merchant_order_id: string
      payment_method: string | null
      paid_at: string | null
      created_at: string
      plan: { id: number; name: string } | null
    }>
  }
}

interface UserSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUser | null
}

export function UserSubscriptionDialog({
  open,
  onOpenChange,
  user,
}: UserSubscriptionDialogProps) {
  const [detail, setDetail] = useState<UserDetailResponse["data"] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !user) {
      setDetail(null)
      return
    }

    async function fetchDetail() {
      setLoading(true)
      try {
        const payload = await api<UserDetailResponse>(
          `/api/admin/monitoring/users/${user?.id}`
        )
        setDetail(payload.data)
      } catch (err) {
        toast.add({
          title: err instanceof ApiError ? err.message : "Gagal memuat data langganan mahasiswa",
          type: "error",
        })
      } finally {
        setLoading(false)
      }
    }

    void fetchDetail()
  }, [open, user])

  function formatDate(iso: string | null) {
    if (!iso) return "-"
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Invoice02Icon} strokeWidth={2} className="size-5 text-primary" />
            Detail Langganan & Pembayaran — {user?.name}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col gap-6 py-2">
            <div className="rounded-lg border p-4 bg-muted/30 space-y-2">
              <Skeleton className="h-3.5 w-36" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-4 w-14 rounded-full" />
              </div>
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-28 w-full rounded-md" />
            </div>
          </div>
        ) : detail ? (
          <div className="flex flex-col gap-6">
            {/* Status Paket Aktif */}
            <div className="rounded-lg border p-4 bg-muted/30">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Paket Aktif Saat Ini
              </span>
              {detail.active_subscription ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-foreground">
                        {detail.active_subscription.plan?.name ?? "Paket Khusus"}
                      </span>
                      <Badge
                        variant={
                          detail.active_subscription.type === "trial"
                            ? "secondary"
                            : "default"
                        }
                      >
                        {detail.active_subscription.type === "trial"
                          ? "Masa Uji Coba (Trial)"
                          : "Berbayar"}
                      </Badge>
                      <Badge variant="default" className="bg-emerald-600">
                        Aktif
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Berlaku dari {formatDate(detail.active_subscription.starts_at)} s.d.{" "}
                      <strong>{formatDate(detail.active_subscription.ends_at)}</strong>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Mahasiswa ini tidak memiliki paket langganan aktif.
                </p>
              )}
            </div>

            {/* Riwayat Pembayaran */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-foreground">
                Riwayat Transaksi Pembayaran ({detail.payments.length})
              </span>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Referensi</TableHead>
                      <TableHead>Paket</TableHead>
                      <TableHead>Nominal</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.payments.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-4 text-xs text-muted-foreground"
                        >
                          Belum ada catatan pembayaran.
                        </TableCell>
                      </TableRow>
                    ) : (
                      detail.payments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-mono text-xs">
                            {p.merchant_order_id}
                          </TableCell>
                          <TableCell className="text-xs font-medium">
                            {p.plan?.name ?? "-"}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            Rp {p.amount.toLocaleString("id-ID")}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {p.payment_method || "-"}
                          </TableCell>
                          <TableCell>
                            {p.status === "paid" && (
                              <Badge variant="default" className="bg-emerald-600 text-xs">
                                Lunas
                              </Badge>
                            )}
                            {p.status === "pending" && (
                              <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 text-xs">
                                Menunggu
                              </Badge>
                            )}
                            {p.status === "failed" && (
                              <Badge variant="destructive" className="text-xs">
                                Gagal
                              </Badge>
                            )}
                            {p.status === "expired" && (
                              <Badge variant="secondary" className="text-xs">
                                Kedaluwarsa
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(p.paid_at || p.created_at)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
