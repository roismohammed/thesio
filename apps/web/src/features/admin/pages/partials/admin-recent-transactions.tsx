import { Link } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import {
  InsetCard,
  InsetCardContent,
  InsetCardHeader,
  InsetCardTitle,
} from "@/components/ui/inset-card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { RecentTransactionItem } from "../types"

interface AdminRecentTransactionsProps {
  data: RecentTransactionItem[]
  loading: boolean
}

const formatIdr = (val: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val)

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return "-"
  try {
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d)
  } catch {
    return dateStr
  }
}

export function AdminRecentTransactions({
  data,
  loading,
}: AdminRecentTransactionsProps) {
  if (loading) {
    return (
      <InsetCard>
        <InsetCardHeader className="flex items-center justify-between pb-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-20" />
        </InsetCardHeader>
        <InsetCardContent className="space-y-2 p-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </InsetCardContent>
      </InsetCard>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "success":
        return (
          <Badge variant="default" className="bg-emerald-600 text-white dark:bg-emerald-700 text-[10px] px-1.5 py-0">
            Lunas
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] px-1.5 py-0">
            Menunggu
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
            Gagal
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            Kedaluwarsa
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {status}
          </Badge>
        )
    }
  }

  return (
    <InsetCard>
      <InsetCardHeader className="flex items-center justify-between pb-1.5">
        <InsetCardTitle>Transaksi Terkini</InsetCardTitle>
        <Link
          to="/admin/plans"
          className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground inline-flex items-center gap-0.5"
        >
          Lihat Semua
          <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
        </Link>
      </InsetCardHeader>
      <InsetCardContent className="overflow-x-auto p-0">
        {data.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Belum ada transaksi pembayaran
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold text-muted-foreground">No. Order</TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground">Mahasiswa</TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground">Paket</TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground">Nominal</TableHead>
                <TableHead className="text-[11px] font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-[11px] font-semibold text-muted-foreground">Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((tx) => (
                <TableRow key={tx.id} className="text-xs">
                  <TableCell className="font-mono font-medium text-foreground py-2.5">
                    {tx.merchant_order_id}
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div className="font-medium text-foreground">
                      {tx.user_name ?? "Anonim"}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {tx.user_email ?? "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground py-2.5">
                    {tx.plan_name ?? "Langganan"}
                  </TableCell>
                  <TableCell className="font-medium text-foreground tabular-nums py-2.5">
                    {formatIdr(tx.amount)}
                  </TableCell>
                  <TableCell className="py-2.5">{getStatusBadge(tx.status)}</TableCell>
                  <TableCell className="text-right font-mono text-[11px] text-muted-foreground tabular-nums py-2.5">
                    {formatDate(tx.paid_at ?? tx.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </InsetCardContent>
    </InsetCard>
  )
}
