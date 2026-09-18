import { Controller, useFormContext } from "react-hook-form"

import { FormItem } from "@/components/forms/form"
import type { FieldOption, FieldProps } from "@/components/forms/types"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface RadioGroupFieldProps extends FieldProps {
  options: FieldOption[]
  className?: string
}

/** Reusable radio group bound to react-hook-form. */
export function RadioGroupField({
  name,
  label,
  description,
  disabled,
  options,
  className,
}: RadioGroupFieldProps) {
  const form = useFormContext()

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem name={name} label={label} description={description} error={fieldState.error}>
          <RadioGroup
            value={field.value ?? ""}
            onValueChange={field.onChange}
            disabled={disabled}
            className={className}
            aria-invalid={!!fieldState.error}
          >
            {options.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <RadioGroupItem id={`${name}-${option.value}`} value={option.value} />
                <label htmlFor={`${name}-${option.value}`} className="text-sm select-none">
                  {option.label}
                </label>
              </div>
            ))}
          </RadioGroup>
        </FormItem>
      )}
    />
  )
}