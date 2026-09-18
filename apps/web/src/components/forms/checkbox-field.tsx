import { Controller, useFormContext } from "react-hook-form"

import { FormItem } from "@/components/forms/form"
import type { FieldProps } from "@/components/forms/types"
import { Checkbox } from "@/components/ui/checkbox"

interface CheckboxFieldProps extends FieldProps {}

/** Reusable checkbox bound to react-hook-form (checked value). */
export function CheckboxField({
  name,
  label,
  description,
  disabled,
}: CheckboxFieldProps) {
  const form = useFormContext()

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem name={name} description={description} error={fieldState.error}>
          <div className="flex items-center gap-2">
            <Checkbox
              id={name}
              checked={!!field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              aria-invalid={!!fieldState.error}
            />
            {label ? (
              <label htmlFor={name} className="text-sm select-none">
                {label}
              </label>
            ) : null}
          </div>
        </FormItem>
      )}
    />
  )
}