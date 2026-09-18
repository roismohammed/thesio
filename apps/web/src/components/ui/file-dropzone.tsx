import { useRef } from "react"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Upload04Icon } from "@hugeicons/core-free-icons"

/**
 * FileDropzone — styled drop zone for single-file uploads (PDF/Word chapter
 * docs, reference files). Visually distinct from a plain input while keeping
 * a native file input for accessibility.
 */
export function FileDropzone({
  className,
  accept,
  disabled,
  label = "Klik untuk memilih berkas",
  hint,
  value,
  onChange,
  ...props
}: Omit<ComponentProps<"input">, "type" | "value"> & {
  label?: string
  hint?: string
  value?: File | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      className={cn(
        "flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-input bg-muted/30 px-4 py-7 text-center transition-colors hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <HugeiconsIcon icon={Upload04Icon} strokeWidth={2} className="text-muted-foreground size-5" />
      <span className="text-sm font-medium">
        {value instanceof File ? value.name : label}
      </span>
      {hint && !(value instanceof File) ? (
        <span className="text-muted-foreground text-xs">{hint}</span>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={onChange}
        {...props}
      />
    </div>
  )
}
