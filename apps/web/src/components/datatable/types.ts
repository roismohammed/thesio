import type {
  ColumnDef,
  ColumnPinningState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import type { ReactNode } from "react"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    title?: string
    enableSorting?: boolean
    enablePinning?: boolean
    enableReordering?: boolean
    enableHiding?: boolean
  }
}

/** Server pagination envelope matched by the API (`{ data, meta }`). */
export interface ServerPaginationMeta {
  current_page: number
  last_page: number
  total: number
}

export interface PaginatedResponse<TData> {
  data: TData[]
  meta: ServerPaginationMeta
}

export interface DataTablePreferenceState {
  pageSize: number
  sorting: SortingState
  columnVisibility: VisibilityState
  columnOrder?: string[]
  columnPinning?: ColumnPinningState
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  title?: ReactNode
  pageCount?: number
  pageIndex?: number
  onPageChange?: (pageIndex: number) => void
  toolbar?: ReactNode
  loading?: boolean
  emptyText?: string
  className?: string

  // Search props (Issue #11)
  tableId?: string
  searchable?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (val: string) => void

  // Preferences props (Issue #11)
  showPreferences?: boolean
  pageSizeOptions?: number[]
  defaultPageSize?: number
  defaultSorting?: SortingState

  // Reordering & Pinning toggles (Issue #10)
  enableColumnReordering?: boolean
  enableColumnPinning?: boolean
  enableColumnVisibility?: boolean
}
