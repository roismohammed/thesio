import { useEffect } from "react"

interface ShortcutHandlers {
  onNew: () => void
  onFocusFilter: () => void
  onAskSuggestion: () => void
  onHelp: () => void
}

/**
 * Global keydown shortcuts for the kanban board: `n` new task, `/` focus
 * filter, `s` ask for suggestions, `?` shortcut help. Ignores keypresses
 * while the focus is inside an input/textarea/select.
 */
export function useKanbanShortcuts({ onNew, onFocusFilter, onAskSuggestion, onHelp }: ShortcutHandlers) {
  useEffect(() => {
    function handler(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      if (!target) {
        return
      }
      const tag = target.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) {
        return
      }

      const key = event.key
      if (key === "n" || key === "N") {
        onNew()
      } else if (key === "/") {
        event.preventDefault()
        onFocusFilter()
      } else if (key === "s" || key === "S") {
        onAskSuggestion()
      } else if (key === "?") {
        onHelp()
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onNew, onFocusFilter, onAskSuggestion, onHelp])
}