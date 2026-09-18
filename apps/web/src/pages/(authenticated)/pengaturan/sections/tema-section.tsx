import { useTranslation } from "react-i18next"
import { useTheme } from "next-themes"

import {
  InsetCard,
  InsetCardContent,
  InsetCardHeader,
  InsetCardTitle,
} from "@/components/ui/inset-card"
import { Field, FieldLabel } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const TEMA_OPTIONS: ReadonlyArray<{
  value: "light" | "dark" | "system"
  labelKey: string
  descriptionKey: string
}> = [
  {
    value: "light",
    labelKey: "page.settings.theme.light",
    descriptionKey: "page.settings.theme.lightDesc",
  },
  {
    value: "dark",
    labelKey: "page.settings.theme.dark",
    descriptionKey: "page.settings.theme.darkDesc",
  },
  {
    value: "system",
    labelKey: "page.settings.theme.system",
    descriptionKey: "page.settings.theme.systemDesc",
  },
]

export function TemaSection() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()

  return (
    <InsetCard>
      <InsetCardHeader>
        <InsetCardTitle>{t("page.settings.theme.title")}</InsetCardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">{t("page.settings.theme.description")}</p>
      </InsetCardHeader>
      <InsetCardContent>
        <RadioGroup
          value={theme ?? "system"}
          onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
          className="gap-3"
        >
          {TEMA_OPTIONS.map((option) => (
            <Field key={option.value} orientation="horizontal">
              <RadioGroupItem id={`tema-${option.value}`} value={option.value} />
              <FieldLabel
                htmlFor={`tema-${option.value}`}
                className="flex-col items-start gap-0.5 cursor-pointer"
              >
                <span className="font-medium text-sm">{t(option.labelKey)}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {t(option.descriptionKey)}
                </span>
              </FieldLabel>
            </Field>
          ))}
        </RadioGroup>
      </InsetCardContent>
    </InsetCard>
  )
}