import { createContext, useContext } from "react"

export type AccentColor = "red" | "blue" | "green" | "violet"

export const ACCENT_COLOR_COOKIE = "accent-color"
export const DEFAULT_ACCENT: AccentColor = "red"

const VALID_ACCENTS: AccentColor[] = ["red", "blue", "green", "violet"]

export function isValidAccent(value: string | undefined): value is AccentColor {
  return typeof value === "string" && (VALID_ACCENTS as string[]).includes(value)
}

export interface AccentColorContextValue {
  accent: AccentColor
  setAccent: (a: AccentColor) => void
}

export const AccentColorContext = createContext<AccentColorContextValue>({
  accent: DEFAULT_ACCENT,
  setAccent: () => {},
})

export function useAccentColor(): AccentColorContextValue {
  return useContext(AccentColorContext)
}