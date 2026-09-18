import { useTranslation } from "react-i18next"

import {
  InsetCard,
  InsetCardContent,
  InsetCardHeader,
  InsetCardTitle,
} from "@/components/ui/inset-card"
import { Field, FieldLabel } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useSidebarVariant } from "@/components/layout/use-sidebar-variant"

const VARIAN_OPTIONS: ReadonlyArray<{
  value: "sidebar" | "inset"
  labelKey: string
  descriptionKey: string
}> = [
  {
    value: "sidebar",
    labelKey: "page.settings.sidebar.sidebarLabel",
    descriptionKey: "page.settings.sidebar.sidebarDesc",
  },
  {
    value: "inset",
    labelKey: "page.settings.sidebar.insetLabel",
    descriptionKey: "page.settings.sidebar.insetDesc",
  },
]

export function VarianSidebarSection() {
  const { t } = useTranslation()
  const { variant, setVariant } = useSidebarVariant()

  return (
    <InsetCard>
      <InsetCardHeader>
        <InsetCardTitle>{t("page.settings.sidebar.title")}</InsetCardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">{t("page.settings.sidebar.description")}</p>
      </InsetCardHeader>
      <InsetCardContent>
        <RadioGroup
          value={variant}
          onValueChange={(value) => setVariant(value as "sidebar" | "inset")}
          className="gap-3"
        >
          {VARIAN_OPTIONS.map((option) => (
            <Field key={option.value} orientation="horizontal">
              <RadioGroupItem
                id={`varian-${option.value}`}
                value={option.value}
              />
              <FieldLabel
                htmlFor={`varian-${option.value}`}
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