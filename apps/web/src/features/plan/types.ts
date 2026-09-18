export interface PlanPermission {
  id: number
  name: string
}

export interface Plan {
  id: number
  name: string
  description: string | null
  price: number
  is_active: boolean
  permissions: PlanPermission[]
}

export interface Subscription {
  id: number
  type: "trial" | "paid"
  status: "active" | "expired"
  starts_at: string
  ends_at: string
  plan: Plan | null
}

export interface Payment {
  id: number
  amount: number
  status: "pending" | "paid" | "expired" | "failed"
  merchant_order_id: string
  reference: string | null
  payment_method: string | null
  paid_at: string | null
  created_at: string
  plan: { id: number; name: string } | null
}

export interface MySubscriptionResponse {
  current: Subscription | null
  payments: Payment[]
}
