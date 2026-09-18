import type { Table } from "@tanstack/react-table"
import type { ReactNode } from "react"
import { SearchIcon, XIcon } from "lucide-react"

import { DataTablePreferences } from "@/components/datatable/data-table-preferences"
import { Input } from "@/components/ui/input"
import { InsetCardHeader, InsetCardTitle } from "@/components/ui/inset-card"

interface DataTableHeaderProps<TData> {
  table: Table<TData>
  title?: ReactNode
  toolbar?: ReactNode
  searchable?: boolean
  searchPlaceholder?: string
  globalFilter: string
  onSearchChange: (val: string) => void
  showPreferences?: boolean
  pageSizeOptions?: number[]
  onResetPreferences?: () => void
}

export function DataTableHeader<TData>({
  table,
  title,
  toolbar,
  searchable = true,
  searchPlaceholder = "Cari data…",
  globalFilter,
  onSearchChange,
  showPreferences = true,
  pageSizeOptions,
  onResetPreferences,
}: DataTableHeaderProps<TData>) {
  const hasContent = title || searchable || toolbar || showPreferences
  if (!hasContent) return null

  return (
    <InsetCardHeader className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-3">
        {title ? (
          typeof title === "string" ? (
            <InsetCardTitle>{title}</InsetCardTitle>
          ) : (
            title
          )
        ) : null}

        {searchable && (
          <div className="relative w-48 sm:w-64">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={globalFilter}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 pl-8 pr-7 text-xs"
            />
            {globalFilter && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-3" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {toolbar}
        {showPreferences && (
          <DataTablePreferences
            table={table}
            pageSizeOptions={pageSizeOptions}
            onReset={onResetPreferences}
          />
        )}
      </div>
    </InsetCardHeader>
  )
}
