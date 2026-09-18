import type { Column, Table } from "@tanstack/react-table"
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  EyeOffIcon,
  MoreVerticalIcon,
  PinIcon,
  PinOffIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { reorderColumn } from "@/components/datatable/data-table-utils"

interface DataTableColumnMenuProps<TData, TValue> {
  column: Column<TData, TValue>
  table: Table<TData>
}

export function DataTableColumnMenu<TData, TValue>({
  column,
  table,
}: DataTableColumnMenuProps<TData, TValue>) {
  const canSort = column.getCanSort()
  const canPin = column.getCanPin()
  const canHide = column.getCanHide()
  const isPinned = column.getIsPinned()
  const sorted = column.getIsSorted()

  const columnOrder = table.getState().columnOrder
  const visibleColumns = table.getVisibleLeafColumns().map((c) => c.id)
  const currentIndex = columnOrder.indexOf(column.id)
  const canMoveLeft = currentIndex > 0
  const canMoveRight = currentIndex !== -1 && currentIndex < columnOrder.length - 1

  function handleMove(direction: "left" | "right") {
    const targetIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= columnOrder.length) return
    const targetColumnId = columnOrder[targetIndex]
    if (!targetColumnId) return
    const newOrder = reorderColumn(column.id, targetColumnId, columnOrder)
    table.setColumnOrder(newOrder)
  }

  if (!canSort && !canPin && !canHide && visibleColumns.length <= 1) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="xs"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground data-[state=open]:bg-accent"
          />
        }
      >
        <MoreVerticalIcon className="size-3.5" />
        <span className="sr-only">Menu Kolom</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-48">
        {canSort && (
          <>
            <DropdownMenuLabel>Pengurutan</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => column.toggleSorting(false)}
              className={sorted === "asc" ? "bg-accent font-medium" : ""}
            >
              <ArrowUpIcon className="size-3.5 text-muted-foreground mr-1.5" />
              Urutkan Menaik (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => column.toggleSorting(true)}
              className={sorted === "desc" ? "bg-accent font-medium" : ""}
            >
              <ArrowDownIcon className="size-3.5 text-muted-foreground mr-1.5" />
              Urutkan Menurun (Z-A)
            </DropdownMenuItem>
            {sorted && (
              <DropdownMenuItem onClick={() => column.clearSorting()}>
                <ArrowUpDownIcon className="size-3.5 text-muted-foreground mr-1.5 opacity-60" />
                Reset Urutan
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </>
        )}

        {canPin && (
          <>
            <DropdownMenuLabel>Sematkan (Pin)</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => column.pin("left")}
              className={isPinned === "left" ? "bg-accent font-medium" : ""}
            >
              <PinIcon className="size-3.5 text-muted-foreground mr-1.5 rotate-45" />
              Sematkan ke Kiri
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => column.pin("right")}
              className={isPinned === "right" ? "bg-accent font-medium" : ""}
            >
              <PinIcon className="size-3.5 text-muted-foreground mr-1.5 -rotate-45" />
              Sematkan ke Kanan
            </DropdownMenuItem>
            {isPinned && (
              <DropdownMenuItem onClick={() => column.pin(false)}>
                <PinOffIcon className="size-3.5 text-muted-foreground mr-1.5" />
                Lepas Sematan
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </>
        )}

        {columnOrder.length > 1 && (
          <>
            <DropdownMenuLabel>Posisi Kolom</DropdownMenuLabel>
            <DropdownMenuItem
              disabled={!canMoveLeft}
              onClick={() => handleMove("left")}
            >
              <ArrowLeftIcon className="size-3.5 text-muted-foreground mr-1.5" />
              Geser ke Kiri
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!canMoveRight}
              onClick={() => handleMove("right")}
            >
              <ArrowRightIcon className="size-3.5 text-muted-foreground mr-1.5" />
              Geser ke Kanan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {canHide && (
          <DropdownMenuItem
            onClick={() => column.toggleVisibility(false)}
            variant="default"
          >
            <EyeOffIcon className="size-3.5 text-muted-foreground mr-1.5" />
            Sembunyikan Kolom
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
