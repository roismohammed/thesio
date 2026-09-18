import { HugeiconsIcon } from "@hugeicons/react"
import {
  ChartHistogramIcon,
  Coins01Icon,
} from "@hugeicons/core-free-icons"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

import {
  InsetCard,
  InsetCardContent,
  InsetCardHeader,
  InsetCardTitle,
} from "@/components/ui/inset-card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import type { MonthlyDataPoint } from "../types"

interface AdminRevenueChartProps {
  data: MonthlyDataPoint[]
  loading: boolean
}

const chartConfig: ChartConfig = {
  revenue: {
    label: "Pendapatan (IDR)",
    color: "var(--color-primary)",
  },
  new_users: {
    label: "Mahasiswa Baru",
    color: "var(--color-chart-2)",
  },
}

const formatIdrCompact = (val: number): string => {
  if (val >= 1_000_000) {
    return `Rp ${(val / 1_000_000).toFixed(1)}jt`
  }
  if (val >= 1_000) {
    return `Rp ${(val / 1_000).toFixed(0)}rb`
  }
  return `Rp ${val}`
}

export function AdminRevenueChart({ data, loading }: AdminRevenueChartProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <InsetCard>
          <InsetCardHeader className="flex items-center justify-between pb-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </InsetCardHeader>
          <InsetCardContent className="gap-2 p-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-48 w-full" />
          </InsetCardContent>
        </InsetCard>
        <InsetCard>
          <InsetCardHeader className="flex items-center justify-between pb-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </InsetCardHeader>
          <InsetCardContent className="gap-2 p-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-48 w-full" />
          </InsetCardContent>
        </InsetCard>
      </div>
    )
  }

  const latestRevenue = data.length > 0 ? data[data.length - 1].revenue : 0
  const latestUsers = data.length > 0 ? data[data.length - 1].new_users : 0

  return (
    <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
      <InsetCard>
        <InsetCardHeader className="flex items-center justify-between pb-1.5">
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon icon={Coins01Icon} size={14} className="text-primary" />
            <InsetCardTitle>Tren Pendapatan</InsetCardTitle>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            6 Bulan Terakhir
          </span>
        </InsetCardHeader>
        <InsetCardContent className="gap-0 p-3">
          <div className="mb-2 flex items-baseline gap-2.5">
            <span className="text-xl font-bold tracking-tight tabular-nums text-foreground">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(latestRevenue)}
            </span>
            <span className="text-xs text-muted-foreground">
              bulan terakhir
            </span>
          </div>
          {data.length === 0 ? (
            <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
              Belum ada data transaksi
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="aspect-auto h-[180px] w-full">
              <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="2 4"
                  stroke="var(--color-border)"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  tickFormatter={formatIdrCompact}
                  width={56}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(val) =>
                        new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          maximumFractionDigits: 0,
                        }).format(Number(val))
                      }
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#fillRevenue)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "var(--color-primary)",
                    stroke: "var(--color-card)",
                    strokeWidth: 2,
                  }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </InsetCardContent>
      </InsetCard>

      <InsetCard>
        <InsetCardHeader className="flex items-center justify-between pb-1.5">
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon icon={ChartHistogramIcon} size={14} className="text-[var(--color-chart-2)]" />
            <InsetCardTitle>Pertumbuhan Mahasiswa</InsetCardTitle>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Akun & Konversi
          </span>
        </InsetCardHeader>
        <InsetCardContent className="gap-0 p-3">
          <div className="mb-2 flex items-baseline gap-2.5">
            <span className="text-xl font-bold tracking-tight tabular-nums text-foreground">
              +{latestUsers}
            </span>
            <span className="text-xs text-muted-foreground">
              pendaftaran bulan terakhir
            </span>
          </div>
          {data.length === 0 ? (
            <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
              Belum ada data mahasiswa
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="aspect-auto h-[180px] w-full">
              <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="2 4"
                  stroke="var(--color-border)"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  allowDecimals={false}
                  width={28}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="new_users"
                  fill="var(--color-chart-2)"
                  radius={[4, 4, 0, 0]}
                  name="Mahasiswa Baru"
                />
              </BarChart>
            </ChartContainer>
          )}
        </InsetCardContent>
      </InsetCard>
    </div>
  )
}
