export interface MonthlyDataPoint {
  month: string
  revenue: number
  new_users: number
  paid_conversions: number
}

export interface PlanBreakdownItem {
  id: number
  name: string
  price: number
  active_users_count: number
  total_revenue: number
}

export interface RecentTransactionItem {
  id: number
  merchant_order_id: string
  amount: number
  status: "pending" | "paid" | "failed" | "expired" | string
  payment_method?: string | null
  user_name?: string | null
  user_email?: string | null
  plan_name?: string | null
  paid_at?: string | null
  created_at: string
}

export interface AdminDashboardData {
  status: string
  mrr: number
  total_revenue: number
  active_subscriptions_count: number
  paid_subscriptions_count: number
  trial_subscriptions_count: number
  total_users_count: number
  new_users_this_month: number
  total_theses_count: number
  active_theses_count: number
  users_count: number
  roles_count: number
  permissions_count: number
  monthly_data: MonthlyDataPoint[]
  plan_breakdown: PlanBreakdownItem[]
  recent_transactions: RecentTransactionItem[]
}

export interface AdminDashboardResponse {
  data: AdminDashboardData
}
