import { Controller, useFormContext } from "react-hook-form"

import { FormItem } from "@/components/forms/form"
import type { FieldOption, FieldProps } from "@/components/forms/types"
import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox"

interface ComboboxFieldProps extends FieldProps {
  options: FieldOption[]
}

/** Reusable searchable combobox bound to react-hook-form. */
export function ComboboxField({
  name,
  label,
  description,
  placeholder = "Pilih…",
  disabled,
  options,
}: ComboboxFieldProps) {
  const form = useFormContext()
  const selected = options.find(
    (option) => option.value === form.getValues(name)
  )

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <FormItem name={name} label={label} description={description} error={fieldState.error}>
          <Combobox value={field.value ?? ""} onValueChange={field.onChange} disabled={disabled}>
            <ComboboxTrigger render={<Button variant="outline" className="w-full justify-between font-normal" />}>
              <ComboboxValue placeholder={selected?.label ?? placeholder}>
                {selected?.label}
              </ComboboxValue>
            </ComboboxTrigger>
            <ComboboxContent>
              <ComboboxList>
                {options.map((option) => (
                  <ComboboxItem key={option.value} value={option.value}>
                    {option.label}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </FormItem>
      )}
    />
  )
}