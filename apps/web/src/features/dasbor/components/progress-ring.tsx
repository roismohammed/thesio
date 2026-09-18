import { useId } from "react"
import { useTranslation } from "react-i18next"

interface ProgressRingProps {
  percent: number
  label: string
}

const RADIUS = 46
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function ProgressRing({ percent, label }: ProgressRingProps) {
  const { t } = useTranslation()
  const gradientId = useId()
  const clamped = Math.max(0, Math.min(100, percent))
  const dash = (clamped / 100) * CIRCUMFERENCE
  const gap = CIRCUMFERENCE - dash
  const ariaLabel = t("common:page.dashboard.skripsiSelesai", {
    defaultValue: label,
  })

  return (
    <div
      className="flex flex-none flex-col items-center justify-center self-center sm:self-start"
      role="img"
      aria-label={`${ariaLabel} ${clamped}%`}
    >
      <div className="relative flex size-28 items-center justify-center">
        <svg
          width="112"
          height="112"
          viewBox="0 0 112 112"
          aria-hidden="true"
          className="-rotate-90"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" className="[stop-color:var(--color-primary)]" />
              <stop offset="100%" className="[stop-color:var(--color-primary)]" />
            </linearGradient>
          </defs>
          <circle
            cx="56"
            cy="56"
            r={RADIUS}
            fill="none"
            className="stroke-muted/40 dark:stroke-muted/20"
            strokeWidth="7"
          />
          <circle
            cx="56"
            cy="56"
            r={RADIUS}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            className="transition-[stroke-dasharray] duration-700 ease-[var(--ease-out)] motion-reduce:transition-none"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
            {clamped}%
          </span>
        </div>
      </div>
      <span className="mt-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
    </div>
  )
}