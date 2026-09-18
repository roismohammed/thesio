import type { Table } from "@tanstack/react-table"
import { RotateCcwIcon, SlidersHorizontalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getColumnTitle } from "@/components/datatable/data-table-utils"

interface DataTablePreferencesProps<TData> {
  table: Table<TData>
  pageSizeOptions?: number[]
  onReset?: () => void
}

export function DataTablePreferences<TData>({
  table,
  pageSizeOptions = [10, 15, 25, 50, 100],
  onReset,
}: DataTablePreferencesProps<TData>) {
  const currentSorting = table.getState().sorting[0]
  const sortableColumns = table
    .getAllColumns()
    .filter((column) => column.getCanSort())
  const hideableColumns = table
    .getAllColumns()
    .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())

  const currentPageSize = table.getState().pagination.pageSize

  function handleSortingColumnChange(columnId: string) {
    if (!columnId) {
      table.setSorting([])
      return
    }
    const isDesc = currentSorting?.desc ?? false
    table.setSorting([{ id: columnId, desc: isDesc }])
  }

  function handleSortingDirectionChange(direction: string) {
    if (!currentSorting) return
    table.setSorting([{ id: currentSorting.id, desc: direction === "desc" }])
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs border-dashed"
          >
            <SlidersHorizontalIcon className="size-3.5 text-muted-foreground" />
            <span>Preferensi</span>
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80 p-3 space-y-3.5">
        <PopoverHeader className="pb-1 border-b border-border/60">
          <div className="flex items-center justify-between">
            <PopoverTitle className="text-xs font-bold text-foreground">
              Preferensi Tabel
            </PopoverTitle>
            {onReset && (
              <Button
                variant="ghost"
                size="xs"
                onClick={onReset}
                className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                title="Kembalikan preferensi ke kondisi bawaan"
              >
                <RotateCcwIcon className="size-3" />
                <span>Atur Ulang</span>
              </Button>
            )}
          </div>
          <PopoverDescription className="text-[11px]">
            Sesuaikan ukuran halaman, pengurutan, dan visibilitas kolom.
          </PopoverDescription>
        </PopoverHeader>

        {/* 1. Baris per Halaman */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-foreground">
            Baris per Halaman
          </label>
          <NativeSelect
            value={currentPageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="w-full text-xs h-7"
            size="sm"
          >
            {pageSizeOptions.map((size) => (
              <NativeSelectOption key={size} value={size}>
                {size} baris
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        {/* 2. Pengurutan Data */}
        {sortableColumns.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground">
              Pengurutan Data
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <NativeSelect
                value={currentSorting?.id ?? ""}
                onChange={(e) => handleSortingColumnChange(e.target.value)}
                className="w-full text-xs h-7"
                size="sm"
              >
                <NativeSelectOption value="">Tanpa Urutan</NativeSelectOption>
                {sortableColumns.map((col) => (
                  <NativeSelectOption key={col.id} value={col.id}>
                    {getColumnTitle(col)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>

              <NativeSelect
                disabled={!currentSorting}
                value={currentSorting?.desc ? "desc" : "asc"}
                onChange={(e) => handleSortingDirectionChange(e.target.value)}
                className="w-full text-xs h-7"
                size="sm"
              >
                <NativeSelectOption value="asc">Menaik (A-Z)</NativeSelectOption>
                <NativeSelectOption value="desc">Menurun (Z-A)</NativeSelectOption>
              </NativeSelect>
            </div>
          </div>
        )}

        {/* 3. Visibilitas Kolom */}
        {hideableColumns.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-border/60">
            <label className="text-[11px] font-semibold text-foreground block">
              Kolom Ditampilkan
            </label>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {hideableColumns.map((column) => {
                const isVisible = column.getIsVisible()
                return (
                  <label
                    key={column.id}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded px-1.5 py-0.5 hover:bg-muted/40 select-none"
                  >
                    <Checkbox
                      checked={isVisible}
                      onCheckedChange={(checked) => column.toggleVisibility(Boolean(checked))}
                    />
                    <span className="truncate">{getColumnTitle(column)}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
