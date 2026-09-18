import { useState, type ReactNode } from "react"

import { getCookie } from "@/lib/get-cookie"
import {
  DEFAULT_VARIANT,
  SIDEBAR_VARIANT_COOKIE,
  SidebarVariantContext,
  isValidVariant,
  type SidebarVariant,
} from "@/components/layout/use-sidebar-variant"

interface SidebarVariantProviderProps {
  children: ReactNode
}

export function SidebarVariantProvider({ children }: SidebarVariantProviderProps) {
  const [variant, setVariantState] = useState<SidebarVariant>(() => {
    const cached = getCookie(SIDEBAR_VARIANT_COOKIE)
    return isValidVariant(cached) ? cached : DEFAULT_VARIANT
  })

  const setVariant = (next: SidebarVariant) => {
    setVariantState(next)
    document.cookie = `${SIDEBAR_VARIANT_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
  }

  return (
    <SidebarVariantContext.Provider value={{ variant, setVariant }}>
      {children}
    </SidebarVariantContext.Provider>
  )
}