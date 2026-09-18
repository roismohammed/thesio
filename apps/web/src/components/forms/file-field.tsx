import { Controller, useFormContext } from "react-hook-form"

import { FormItem } from "@/components/forms/form"
import type { FieldProps } from "@/components/forms/types"
import { FileDropzone } from "@/components/ui/file-dropzone"

interface FileFieldProps extends FieldProps {
  accept?: string
  hint?: string
  /** Called with the selected FileList (single file) on change. */
  onSelected?: (file: File | null) => void
}

/** Reusable file field (FileDropzone) bound to react-hook-form. */
export function FileField({
  name,
  label,
  description,
  disabled,
  accept,
  hint,
  required,
  onSelected,
}: FileFieldProps) {
  const form = useFormContext()

  return (
    <Controller
      name={name}
      control={form.control}
      rules={{ required: required ? "Berkas wajib dipilih" : false }}
      render={({ field, fieldState }) => (
        <FormItem name={name} label={label} description={description} error={fieldState.error}>
          <FileDropzone
            id={name}
            accept={accept}
            disabled={disabled}
            hint={hint}
            value={field.value}
            aria-invalid={!!fieldState.error}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null
              field.onChange(file)
              onSelected?.(file)
            }}
          />
        </FormItem>
      )}
    />
  )
}