import { Controller, useFormContext } from "react-hook-form"

import { FormItem } from "@/components/forms/form"
import type { FieldOption, FieldProps } from "@/components/forms/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SelectFieldProps extends FieldProps {
  options: FieldOption[]
  onValueChange?: (value: string) => void
}

/** Reusable select bound to react-hook-form. */
export function SelectField({
  name,
  label,
  description,
  placeholder = "Pilih…",
  disabled,
  options,
  onValueChange,
}: SelectFieldProps) {
  const form = useFormContext()

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem name={name} label={label} description={description} error={fieldState.error}>
          <Select
            value={field.value ?? ""}
            onValueChange={(value) => {
              field.onChange(value)
              onValueChange?.(value)
            }}
            disabled={disabled}
          >
            <SelectTrigger className="w-full" aria-invalid={!!fieldState.error}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  )
}