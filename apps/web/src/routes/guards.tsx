import { useEffect, useState, type ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"

import { useAuth } from "@/lib/auth-context"
import { usePermission } from "@/hooks/use-permission"
import { LandingPage } from "@/features/landing/pages/landing-page"

interface GuestGuardProps {
  children: ReactNode
}

/**
 * Redirects authenticated users away from guest-only pages (login/register/forgot).
 * Super admin goes to /admin, regular user goes to /dashboard.
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const { user, loading } = useAuth()
  const { hasRole } = usePermission()

  if (loading) {
    return null
  }

  if (user) {
    return <Navigate to={hasRole("super admin") ? "/admin" : "/dashboard"} replace />
  }

  return <>{children}</>
}

/**
 * Landing router for route "/":
 * - Unauthenticated guest: LandingPage
 * - Authenticated super admin: /admin
 * - Authenticated user: /dashboard
 */
export function RoleLanding() {
  const { user, loading } = useAuth()
  const { hasRole } = usePermission()

  if (loading) {
    return null
  }

  if (!user) {
    return <LandingPage />
  }

  return <Navigate to={hasRole("super admin") ? "/admin" : "/dashboard"} replace />
}

interface AuthGuardProps {
  children: ReactNode
}

/**
 * Redirects unauthenticated users to the login page.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

interface AdminGuardProps {
  children: ReactNode
}

/**
 * Blocks non-super-admin users from admin pages with a friendly access-denied state.
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading } = useAuth()
  const { hasRole } = usePermission()

  if (loading) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!hasRole("super admin")) {
    return <Navigate to="/access-denied" replace />
  }

  return <>{children}</>
}

interface SubscriptionPermissionGuardProps {
  permission: string
  children: ReactNode
}

/**
 * Guards routes requiring an active subscription with a specific permission.
 * Super admins bypass this check.
 * Non-permitted users are redirected to /plans.
 */
export function SubscriptionPermissionGuard({
  permission,
  children,
}: SubscriptionPermissionGuardProps) {
  const { user, loading, refresh } = useAuth()
  const { hasRole, hasPermission } = usePermission()
  const [revalidating, setRevalidating] = useState(false)
  const [checked, setChecked] = useState(false)

  const allowed = hasRole("super admin") || hasPermission(permission)

  useEffect(() => {
    if (!loading && user && !allowed && !checked) {
      setRevalidating(true)
      void refresh().finally(() => {
        setRevalidating(false)
        setChecked(true)
      })
    }
  }, [loading, user, allowed, checked, refresh])

  if (loading || revalidating) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowed) {
    return <>{children}</>
  }

  if (checked) {
    return <Navigate to="/plans" replace />
  }

  return null
}
