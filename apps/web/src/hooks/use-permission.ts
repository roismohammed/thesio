import { useAuth } from "@/lib/auth-context"

/**
 * Client-side permission helpers. UX layer only — the server-side
 * `role:super-admin` middleware remains the authoritative guard.
 */
export function usePermission() {
  const { user } = useAuth()

  function hasRole(...roles: string[]): boolean {
    if (!user) {
      return false
    }
    return roles.some((role) => user.roles.includes(role))
  }

  function hasPermission(...permissions: string[]): boolean {
    if (!user) {
      return false
    }
    return permissions.some((permission) =>
      user.permissions.includes(permission),
    )
  }

  return { hasRole, hasPermission }
}
