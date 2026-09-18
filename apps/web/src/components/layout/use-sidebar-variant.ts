import { createContext, useContext } from "react"

export type SidebarVariant = "sidebar" | "inset"

export const SIDEBAR_VARIANT_COOKIE = "sidebar-variant"
export const DEFAULT_VARIANT: SidebarVariant = "sidebar"

const VALID_VARIANTS: SidebarVariant[] = ["sidebar", "inset"]

export function isValidVariant(value: string | undefined): value is SidebarVariant {
  return typeof value === "string" && (VALID_VARIANTS as string[]).includes(value)
}

export interface SidebarVariantContextValue {
  variant: SidebarVariant
  setVariant: (v: SidebarVariant) => void
}

export const SidebarVariantContext = createContext<SidebarVariantContextValue>({
  variant: DEFAULT_VARIANT,
  setVariant: () => {},
})

export function useSidebarVariant(): SidebarVariantContextValue {
  return useContext(SidebarVariantContext)
}