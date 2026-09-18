import type { Column } from "@tanstack/react-table"
import type { HTMLAttributes } from "react"
import { ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DataTableColumnHeaderProps<TData, TValue>
  extends HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

/** Sortable column header with backward compatibility. */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn("text-xs font-semibold text-muted-foreground", className)}>{title}</div>
  }

  const sorted = column.getIsSorted()

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="xs"
        className="-ml-2 h-7 px-2 font-semibold text-xs text-muted-foreground hover:text-foreground data-[state=open]:bg-accent"
        onClick={() => column.toggleSorting(sorted === "asc")}
      >
        <span>{title}</span>
        {sorted === "asc" ? (
          <ArrowUpIcon className="size-3.5 text-foreground" />
        ) : sorted === "desc" ? (
          <ArrowDownIcon className="size-3.5 text-foreground" />
        ) : (
          <ArrowUpDownIcon className="size-3.5 opacity-40 hover:opacity-100" />
        )}
      </Button>
    </div>
  )
}
