import { Controller, useFormContext } from "react-hook-form"

import { FormItem } from "@/components/forms/form"
import type { FieldProps } from "@/components/forms/types"
import { Switch } from "@/components/ui/switch"

interface SwitchFieldProps extends FieldProps {}

/** Reusable switch bound to react-hook-form (checked boolean). */
export function SwitchField({
  name,
  label,
  description,
  disabled,
}: SwitchFieldProps) {
  const form = useFormContext()

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem name={name} description={description} error={fieldState.error}>
          <div className="flex items-center justify-between gap-2">
            {label ? (
              <span className="text-sm select-none">{label}</span>
            ) : null}
            <Switch
              id={name}
              checked={!!field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              aria-invalid={!!fieldState.error}
            />
          </div>
        </FormItem>
      )}
    />
  )
}