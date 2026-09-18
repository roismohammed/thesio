import type { ReactNode } from "react"

/**
 * Shared props for every reusable form field.
 * Each field composes a `components/ui` control + `components/ui/field.tsx`
 * shell + react-hook-form binding. No styling is re-invented here.
 */
export interface FieldProps {
  name: string
  label?: string
  description?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

/** Options for select/combobox/radio fields. */
export interface FieldOption {
  label: string
  value: string
}

/** Renders the FieldError node from react-hook-form field state. */
export interface FieldErrorProps {
  error?: { message?: string } | null
  children?: ReactNode
}
