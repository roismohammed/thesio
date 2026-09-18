import { Controller, useFormContext } from "react-hook-form"
import type { ComponentProps } from "react"

import { Input } from "@/components/ui/input"
import { FormItem } from "@/components/forms/form"
import type { FieldProps } from "@/components/forms/types"

interface TextFieldProps extends FieldProps, Omit<ComponentProps<"input">, "name"> {}

/** Reusable text input bound to react-hook-form. */
export function TextField({
  name,
  label,
  description,
  placeholder,
  disabled,
  required,
  className,
  ...rest
}: TextFieldProps) {
  const form = useFormContext()

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem name={name} label={label} description={description} error={fieldState.error}>
          <Input
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