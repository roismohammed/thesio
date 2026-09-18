import type { Column } from "@tanstack/react-table"
import type { CSSProperties } from "react"
import { arrayMove } from "@dnd-kit/sortable"

/**
 * Computes sticky CSS properties for a pinned TanStack Table column.
 */
export function getPinningStyles<TData, TValue>(
  column: Column<TData, TValue>,
  isHeader = false
): CSSProperties {
  const isPinned = column.getIsPinned()
  if (!isPinned) return {}

  const isLeft = isPinned === "left"
  const isRight = isPinned === "right"

  return {
    left: isLeft ? `${column.getStart("left")}px` : undefined,
    right: isRight ? `${column.getAfter("right")}px` : undefined,
    position: "sticky",
    zIndex: isHeader ? (isPinned ? 20 : 10) : isPinned ? 10 : 1,
  }
}

/**
 * Returns Tailwind classes for pinned column cells (background opacity & border shadow).
 */
export function getPinningClass<TData, TValue>(
  column: Column<TData, TValue>
): string {
  const isPinned = column.getIsPinned()
  if (!isPinned) return ""

  const isLastLeft = isPinned === "left" && column.getIsLastColumn("left")
  const isFirstRight = isPinned === "right" && column.getIsFirstColumn("right")

  return [
    "bg-card",
    isLastLeft ? "border-r border-border shadow-[1px_0_0_0_var(--color-border)]" : "",
    isFirstRight ? "border-l border-border shadow-[-1px_0_0_0_var(--color-border)]" : "",
  ]
    .filter(Boolean)
    .join(" ")
}

/**
 * Reorders column IDs array when dragging from one position to another.
 */
export function reorderColumn(
  draggedColumnId: string,
  targetColumnId: string,
  columnOrder: string[]
): string[] {
  const oldIndex = columnOrder.indexOf(draggedColumnId)
  const newIndex = columnOrder.indexOf(targetColumnId)
  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
    return columnOrder
  }
  return arrayMove(columnOrder, oldIndex, newIndex)
}

/**
 * Returns user-friendly title for a column (checking meta.title or column id fallback).
 */
export function getColumnTitle<TData, TValue>(
  column: Column<TData, TValue>
): string {
  if (column.columnDef.meta?.title) {
    return column.columnDef.meta.title
  }
  if (typeof column.columnDef.header === "string") {
    return column.columnDef.header
  }
  return column.id
}
