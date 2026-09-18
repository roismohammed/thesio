import { useLayoutEffect, useState, type ReactNode } from "react"

import { getCookie } from "@/lib/get-cookie"
import {
  ACCENT_COLOR_COOKIE,
  DEFAULT_ACCENT,
  AccentColorContext,
  isValidAccent,
  type AccentColor,
} from "@/components/layout/use-accent-color"

interface AccentColorProviderProps {
  children: ReactNode
}

export function AccentColorProvider({ children }: AccentColorProviderProps) {
  const [accent, setAccentState] = useState<AccentColor>(() => {
    const cached = getCookie(ACCENT_COLOR_COOKIE)
    return isValidAccent(cached) ? cached : DEFAULT_ACCENT
  })

  useLayoutEffect(() => {
    document.documentElement.dataset.accent = accent
  }, [accent])

  const setAccent = (next: AccentColor) => {
    setAccentState(next)
    document.cookie = `${ACCENT_COLOR_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
  }

  return (
    <AccentColorContext.Provider value={{ accent, setAccent }}>
      {children}
    </AccentColorContext.Provider>
  )
}