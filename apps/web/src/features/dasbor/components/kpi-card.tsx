import {
  InsetCard,
  InsetCardContent,
  InsetCardHeader,
  InsetCardTitle,
} from "@/components/ui/inset-card"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  value: string
  unit?: string
  label: string
  sub: string
  highlight?: boolean
}

export function KpiCard({ value, unit, label, sub, highlight }: KpiCardProps) {
  return (
    <InsetCard className="p-1.5 transition-shadow duration-150 hover:shadow-xs">
      <InsetCardHeader className="px-1.5 pt-0.5 pb-1">
        <InsetCardTitle className="text-[11px] font-semibold text-muted-foreground truncate" title={label}>
          {label}
        </InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className="gap-0.5 p-2.5">
        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              "text-2xl font-bold leading-none tracking-tight tabular-nums sm:text-3xl",
              highlight ? "text-primary" : "text-foreground"
            )}
          >
            {value}
          </span>
          {unit && (
            <span className="text-xs font-medium text-muted-foreground sm:text-sm">
              {unit}
            </span>
          )}
        </div>
        <p className="mt-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground/80">
          {sub}
        </p>
      </InsetCardContent>
    </InsetCard>
  )
}