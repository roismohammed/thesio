import { useTranslation } from "react-i18next"
import { HugeiconsIcon } from "@hugeicons/react"
import { TranslateIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const current = (i18n.language ?? "id").split("-")[0] as "id" | "en"
  const code = t(`language.code.${current}`)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("language.switcher.ariaLabel")}
            className="gap-1.5"
          />
        }
      >
        <HugeiconsIcon icon={TranslateIcon} strokeWidth={2} className="size-4" />
        <span className="text-xs font-medium tabular-nums">{code}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-32">
        <DropdownMenuItem onClick={() => i18n.changeLanguage("id")}>
          {t("language.name.id")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => i18n.changeLanguage("en")}>
          {t("language.name.en")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}