export interface AdminUser {
  id: number
  name: string
  email: string
  is_disabled: boolean
  disabled_reason: string | null
  roles?: string[]
  created_at?: string
  active_subscription?: {
    id: number
    type: "trial" | "paid"
    status: "active" | "expired"
    starts_at: string
    ends_at: string
    plan: {
      id: number
      name: string
      price: number
    } | null
  } | null
  payments_count?: number
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  total: number
}

export interface UserListResponse {
  data: AdminUser[]
  meta: PaginationMeta
}
