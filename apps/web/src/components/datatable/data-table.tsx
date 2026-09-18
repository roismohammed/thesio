import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type {
  ColumnPinningState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import { useEffect, useMemo, useState } from "react"

import { DataTableDraggableHeader } from "@/components/datatable/data-table-draggable-header"
import { DataTableHeader } from "@/components/datatable/data-table-header"
import { DataTablePagination } from "@/components/datatable/data-table-pagination"
import {
  getPinningClass,
  getPinningStyles,
  reorderColumn,
} from "@/components/datatable/data-table-utils"
import type { DataTablePreferenceState, DataTableProps } from "@/components/datatable/types"
import { Button } from "@/components/ui/button"
import { InsetCard, InsetCardContent } from "@/components/ui/inset-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export function DataTable<TData, TValue>({
  columns,
  data,
  title,
  pageCount,
  pageIndex = 0,
  onPageChange,
  toolbar,
  loading = false,
  emptyText = "Tidak ada data.",
  className,
  tableId,
  searchable = true,
  searchPlaceholder = "Cari data…",
  searchValue,
  onSearchChange,
  showPreferences = true,
  pageSizeOptions = [10, 15, 25, 50, 100],
  defaultPageSize = 15,
  defaultSorting = [],
  enableColumnReordering = true,
  enableColumnPinning = true,
  enableColumnVisibility = true,
}: DataTableProps<TData, TValue>) {
  const storageKey = tableId ? `table_prefs_${tableId}` : null

  const initialColumnOrder = useMemo(() => {
    return columns.map((c) => (c.id ?? (c as { accessorKey?: string }).accessorKey ?? ""))
  }, [columns])

  const savedPrefs = useMemo<Partial<DataTablePreferenceState>>(() => {
    if (!storageKey) return {}
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }, [storageKey])

  const [sorting, setSorting] = useState<SortingState>(savedPrefs.sorting ?? defaultSorting)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(savedPrefs.columnVisibility ?? {})
  const [columnOrder, setColumnOrder] = useState<string[]>(savedPrefs.columnOrder ?? initialColumnOrder)
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(savedPrefs.columnPinning ?? {})
  const [pageSize, setPageSize] = useState<number>(savedPrefs.pageSize ?? defaultPageSize)
  const [globalFilter, setGlobalFilter] = useState<string>(searchValue ?? "")

  useEffect(() => {
    if (searchValue !== undefined) setGlobalFilter(searchValue)
  }, [searchValue])

  useEffect(() => {
    if (!storageKey) return
    const stateToSave: DataTablePreferenceState = {
      pageSize,
      sorting,
      columnVisibility,
      columnOrder,
      columnPinning,
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(stateToSave))
    } catch {
      // Ignore quota errors
    }
  }, [storageKey, pageSize, sorting, columnVisibility, columnOrder, columnPinning])

  function handleReset() {
    setSorting(defaultSorting)
    setColumnVisibility({})
    setColumnOrder(initialColumnOrder)
    setColumnPinning({})
    setPageSize(defaultPageSize)
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey)
      } catch {
        // Ignore
      }
    }
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnOrder,
      columnPinning,
      globalFilter,
      pagination: { pageIndex, pageSize },
    },
    enableSorting: true,
    enableColumnPinning,
    enableHiding: enableColumnVisibility,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    onGlobalFilterChange: (val) => {
      setGlobalFilter(String(val))
      onSearchChange?.(String(val))
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const next = updater({ pageIndex, pageSize })
        setPageSize(next.pageSize)
        if (onPageChange && next.pageIndex !== pageIndex) onPageChange(next.pageIndex)
      }
    },
    manualPagination: pageCount !== undefined,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: pageCount === undefined ? getPaginationRowModel() : undefined,
  })

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      const newOrder = reorderColumn(String(active.id), String(over.id), table.getState().columnOrder)
      setColumnOrder(newOrder)
    }
  }

  return (
    <InsetCard className={cn("gap-0", className)}>
      <DataTableHeader
        table={table}
        title={title}
        toolbar={toolbar}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        globalFilter={globalFilter}
        onSearchChange={(val) => {
          setGlobalFilter(val)
          onSearchChange?.(val)
        }}
        showPreferences={showPreferences}
        pageSizeOptions={pageSizeOptions}
        onResetPreferences={handleReset}
      />

      <InsetCardContent className="p-0 overflow-hidden gap-0 bg-card">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    <SortableContext items={table.getState().columnOrder} strategy={horizontalListSortingStrategy}>
                      {headerGroup.headers.map((header) => (
                        <DataTableDraggableHeader
                          key={header.id}
                          header={header}
                          table={table}
                          enableColumnReordering={enableColumnReordering}
                        />
                      ))}
                    </SortableContext>
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading && data.length === 0 ? (
                  Array.from({ length: Math.min(pageSize, 5) }).map((_, rowIndex) => (
                    <TableRow key={`skeleton-row-${rowIndex}`}>
                      {(table.getVisibleLeafColumns().length > 0
                        ? table.getVisibleLeafColumns()
                        : columns
                      ).map((column, colIndex) => {
                        const colId =
                          "id" in column && column.id
                            ? column.id
                            : "accessorKey" in column && typeof column.accessorKey === "string"
                              ? column.accessorKey
                              : String(colIndex)
                        return (
                          <TableCell
                            key={`skeleton-cell-${colId}-${colIndex}`}
                            className="py-3"
                          >
                            <Skeleton
                              className={cn(
                                "h-4",
                                colId === "actions"
                                  ? "w-16 ml-auto"
                                  : colId === "status"
                                    ? "w-20"
                                    : "w-3/4"
                              )}
                            />
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={getPinningStyles(cell.column)}
                          className={cn(getPinningClass(cell.column))}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={table.getVisibleLeafColumns().length || columns.length || 1}
                      className="h-24 text-center text-muted-foreground text-xs"
                    >
                      {emptyText}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DndContext>

        {pageCount !== undefined && onPageChange ? (
          <div className="flex items-center justify-end gap-2 border-t p-3">
            <Button
              variant="outline"
              size="sm"
              disabled={pageIndex <= 0}
              onClick={() => onPageChange(pageIndex - 1)}
            >
              Sebelumnya
            </Button>
            <span className="text-muted-foreground text-sm">Halaman {pageIndex + 1}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={pageIndex + 1 >= (pageCount ?? 1)}
              onClick={() => onPageChange(pageIndex + 1)}
            >
              Berikutnya
            </Button>
          </div>
        ) : (
          <div className="border-t">
            <DataTablePagination table={table} />
          </div>
        )}
      </InsetCardContent>
    </InsetCard>
  )
}
