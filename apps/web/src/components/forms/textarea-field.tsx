import { Controller, useFormContext } from "react-hook-form"
import type { ComponentProps } from "react"

import { Textarea } from "@/components/ui/textarea"
import { FormItem } from "@/components/forms/form"
import type { FieldProps } from "@/components/forms/types"

interface TextareaFieldProps
  extends FieldProps,
    Omit<ComponentProps<"textarea">, "name"> {}

/** Reusable textarea bound to react-hook-form. */
export function TextareaField({
  name,
  label,
  description,
  placeholder,
  disabled,
  className,
  ...rest
}: TextareaFieldProps) {
  const form = useFormContext()

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem name={name} label={label} description={description} error={fieldState.error}>
          <Textarea
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={!!fieldState.error}
            className={className}
            {...field}
            {...rest}
          />
        </FormItem>
      )}
    />
  )
}