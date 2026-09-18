import type { Table } from "@tanstack/react-table"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

/** Server/client pagination controls. */
export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = table.getPageCount()
  const totalRows = table.getFilteredRowModel().rows.length

  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 text-xs">
      <div className="text-muted-foreground">
        {totalRows > 0 ? (
          <span>
            Menampilkan <strong className="text-foreground">{startRow}-{endRow}</strong> dari{" "}
            <strong className="text-foreground">{totalRows}</strong> baris
          </span>
        ) : (
          <span>Halaman {pageIndex + 1} dari {pageCount || 1}</span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground mr-2">
          Hal. {pageIndex + 1} / {pageCount || 1}
        </span>
        <Button
          variant="outline"
          size="xs"
          className="h-7 gap-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeftIcon className="size-3.5" />
          <span>Sebelumnya</span>
        </Button>
        <Button
          variant="outline"
          size="xs"
          className="h-7 gap-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <span>Berikutnya</span>
          <ChevronRightIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
