import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"

interface DataTableToolbarProps {
  search?: string
  onSearchChange?: (value: string) => void
  placeholder?: string
}

/** Toolbar slot with an optional search input (left) + action slot (right). */
export function DataTableToolbar({
  search,
  onSearchChange,
  placeholder = "Cari…",
}: DataTableToolbarProps) {
  return (
    <>
      <div className="relative w-64 max-w-full">
        <SearchIcon className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
        <Input
          value={search ?? ""}
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder={placeholder}
          className="pl-8"
        />
      </div>
    </>
  )
}
