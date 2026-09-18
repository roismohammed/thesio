import { useTranslation } from "react-i18next"

import {
  InsetCard,
  InsetCardContent,
  InsetCardHeader,
  InsetCardTitle,
} from "@/components/ui/inset-card"
import { Label } from "@/components/ui/label"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  useAccentColor,
  type AccentColor,
} from "@/components/layout/use-accent-color"

interface AccentOption {
  value: AccentColor
  labelKey: string
  swatch: string
}

const ACCENT_OPTIONS: ReadonlyArray<AccentOption> = [
  { value: "red", labelKey: "page.settings.accent.red", swatch: "oklch(0.514 0.222 16.935)" },
  { value: "blue", labelKey: "page.settings.accent.blue", swatch: "oklch(0.514 0.222 250)" },
  { value: "green", labelKey: "page.settings.accent.green", swatch: "oklch(0.514 0.222 145)" },
  { value: "violet", labelKey: "page.settings.accent.violet", swatch: "oklch(0.514 0.222 300)" },
]

export function WarnaAccentSection() {
  const { t } = useTranslation()
  const { accent, setAccent } = useAccentColor()

  return (
    <InsetCard>
      <InsetCardHeader>
        <InsetCardTitle>{t("page.settings.accent.title")}</InsetCardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">{t("page.settings.accent.description")}</p>
      </InsetCardHeader>
      <InsetCardContent>
        <ToggleGroup
          value={[accent]}
          onValueChange={(groupValue) => {
            const next = groupValue[0]
            if (next) {
              setAccent(next as AccentColor)
            }
          }}
          variant="outline"
          className="gap-3"
        >
          {ACCENT_OPTIONS.map((option) => {
            const label = t(option.labelKey)
            return (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                aria-label={label}
                className="flex-col gap-2 px-3 py-2 data-pressed:border-primary data-pressed:bg-primary/5 cursor-pointer"
              >
                <span
                  className="size-6 rounded-full ring-1 ring-black/10 dark:ring-white/10"
                  style={{ backgroundColor: option.swatch }}
                />
                <Label className="text-xs font-normal cursor-pointer">{label}</Label>
              </ToggleGroupItem>
            )
          })}
        </ToggleGroup>
      </InsetCardContent>
    </InsetCard>
  )
}