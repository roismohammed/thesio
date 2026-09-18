import { flexRender } from "@tanstack/react-table"
import type { Header, Table } from "@tanstack/react-table"
import { useSortable } from "@dnd-kit/sortable"
import type { CSSProperties } from "react"
import { GripVerticalIcon } from "lucide-react"

import { TableHead } from "@/components/ui/table"
import { DataTableColumnMenu } from "@/components/datatable/data-table-column-menu"
import { getPinningClass, getPinningStyles } from "@/components/datatable/data-table-utils"
import { cn } from "@/lib/utils"

interface DataTableDraggableHeaderProps<TData, TValue> {
  header: Header<TData, TValue>
  table: Table<TData>
  enableColumnReordering?: boolean
}

export function DataTableDraggableHeader<TData, TValue>({
  header,
  table,
  enableColumnReordering = true,
}: DataTableDraggableHeaderProps<TData, TValue>) {
  const column = header.column
  const isPinned = Boolean(column.getIsPinned())
  const canReorder = enableColumnReordering && !isPinned && (column.columnDef.meta?.enableReordering ?? true)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    disabled: !canReorder,
  })

  const pinningStyles = getPinningStyles(column, true)
  const pinningClass = getPinningClass(column)

  const style: CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.6 : 1,
    ...pinningStyles,
  }

  if (header.isPlaceholder) {
    return <TableHead key={header.id} style={style} className={pinningClass} />
  }

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/head relative whitespace-nowrap bg-card select-none",
        isDragging && "z-30 shadow-lg ring-1 ring-primary/30",
        pinningClass
      )}
    >
      <div className="flex items-center justify-between gap-1.5 min-h-7">
        <div className="flex items-center gap-1 min-w-0">
          {canReorder && (
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-foreground opacity-0 group-hover/head:opacity-100 transition-opacity p-0.5 -ml-1 rounded focus:opacity-100 focus:outline-none"
              title="Geser untuk mengatur posisi kolom"
            >
              <GripVerticalIcon className="size-3" />
            </button>
          )}
          <div className="min-w-0 truncate">
            {flexRender(column.columnDef.header, header.getContext())}
          </div>
        </div>

        <DataTableColumnMenu column={column} table={table} />
      </div>
    </TableHead>
  )
}
