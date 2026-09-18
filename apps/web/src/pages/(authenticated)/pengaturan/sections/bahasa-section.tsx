import { useTranslation } from "react-i18next"

import {
  InsetCard,
  InsetCardContent,
  InsetCardHeader,
  InsetCardTitle,
} from "@/components/ui/inset-card"
import { Field, FieldLabel } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type LanguageCode = "id" | "en"

const BAHASA_OPTIONS: ReadonlyArray<{
  value: LanguageCode
  labelKey: string
  descriptionKey: string
}> = [
  {
    value: "id",
    labelKey: "page.settings.language.idLabel",
    descriptionKey: "page.settings.language.idDesc",
  },
  {
    value: "en",
    labelKey: "page.settings.language.enLabel",
    descriptionKey: "page.settings.language.enDesc",
  },
]

function detectLanguage(lng: string | undefined): LanguageCode {
  const base = (lng ?? "id").split("-")[0]
  return base === "en" ? "en" : "id"
}

export function BahasaSection() {
  const { t, i18n } = useTranslation()
  const current = detectLanguage(i18n.language)

  return (
    <InsetCard>
      <InsetCardHeader>
        <InsetCardTitle>{t("page.settings.language.title")}</InsetCardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("page.settings.language.description")}
        </p>
      </InsetCardHeader>
      <InsetCardContent>
        <RadioGroup
          value={current}
          onValueChange={(value) => i18n.changeLanguage(value as LanguageCode)}
          className="gap-3"
        >
          {BAHASA_OPTIONS.map((option) => (
            <Field key={option.value} orientation="horizontal">
              <RadioGroupItem
                id={`bahasa-${option.value}`}
                value={option.value}
              />
              <FieldLabel
                htmlFor={`bahasa-${option.value}`}
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