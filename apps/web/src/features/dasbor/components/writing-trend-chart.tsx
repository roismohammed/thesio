import { useTranslation } from "react-i18next"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
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
  type ChartConfig,
} from "@/components/ui/chart"
import type { WeeklyWordsPoint } from "@/features/dasbor/types"

interface WritingTrendChartProps {
  data: WeeklyWordsPoint[]
  wordsTarget: number
  totalWords: number
}

const chartConfig: ChartConfig = {
  words: {
    label: "Kata",
    color: "var(--color-primary)",
  },
}

export function WritingTrendChart({
  data,
  wordsTarget,
  totalWords,
}: WritingTrendChartProps) {
  const { t } = useTranslation()

  return (
    <InsetCard>
      <InsetCardHeader className="flex items-center justify-between pb-1.5">
        <InsetCardTitle>{t("common:page.dashboard.writingTrendTitle")}</InsetCardTitle>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          {t("common:page.dashboard.writingTrendHint")}
        </span>
      </InsetCardHeader>
      <InsetCardContent className="gap-0 p-3">
        <div className="mb-2 flex items-baseline gap-2.5">
          <span className="text-xl font-bold tracking-tight tabular-nums text-foreground">
            {totalWords.toLocaleString("id-ID")}
          </span>
          <span className="text-xs text-muted-foreground">
            {t("common:page.dashboard.writingTrendTarget", {
              target: wordsTarget.toLocaleString("id-ID"),
            })}
          </span>
        </div>
        <ChartContainer config={chartConfig} className="aspect-auto h-[160px] w-full">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="wordsFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.18}
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
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
              }
              width={32}
            />
            <ReferenceLine
              y={wordsTarget}
              stroke="var(--color-success)"
              strokeWidth={1.5}
              strokeDasharray="5 4"
            />
            <Area
              dataKey="words"
              type="monotone"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#wordsFill)"
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
      </InsetCardContent>
    </InsetCard>
  )
}