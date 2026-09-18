import { useTranslation } from "react-i18next"
import { KeyboardIcon } from "lucide-react"

import { Kbd } from "@/components/ui/kbd"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

/**
 * Popover listing the board's keyboard shortcuts with Kbd hints, triggered
 * by `?` or the toolbar icon.
 */
interface ShortcutHelpPopoverProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ShortcutHelpPopover({ open, onOpenChange }: ShortcutHelpPopoverProps) {
  const { t } = useTranslation("thesis")

  const shortcuts = [
    { key: "n", label: t("kanban.shortcuts.newTask") },
    { key: "/", label: t("kanban.shortcuts.focusFilter") },
    { key: "s", label: t("kanban.shortcuts.askSuggestion") },
    { key: "?", label: t("kanban.shortcuts.help") },
  ]

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="size-8">
            <KeyboardIcon className="size-4" />
            <span className="sr-only">{t("kanban.shortcuts.help")}</span>
          </Button>
        }
      />
      <PopoverContent align="end" className="w-64">
        <p className="px-2 pt-1.5 text-sm font-medium">{t("kanban.shortcuts.title")}</p>
        <div className="grid gap-1">
          {shortcuts.map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-md px-2 py-1.5">
              <span className="text-sm">{item.label}</span>
              <Kbd>{item.key}</Kbd>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}