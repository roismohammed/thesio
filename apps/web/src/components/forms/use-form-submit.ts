import type { SubmitHandler } from "react-hook-form"
import type { FieldValues } from "react-hook-form"

import { ApiError } from "@/lib/api"
import { toast } from "@/components/ui/toast"

/**
 * Wraps a react-hook-form submit handler with API-error → toast mapping.
 * Returns an async handler safe to pass straight to the form's `onSubmit`.
 */
export function useFormSubmit<TFormValues extends FieldValues>(
  onSubmit: SubmitHandler<TFormValues>,
  options?: { successMessage?: string },
): SubmitHandler<TFormValues> {
  return async (values, event) => {
    try {
      await onSubmit(values, event)
      if (options?.successMessage) {
        toast.add({ title: options.successMessage, type: "success" })
      }
    } catch (err) {
      toast.add({
        title: err instanceof ApiError ? err.message : "Terjadi kesalahan. Silakan coba lagi.",
        type: "error",
      })
    }
  }
}