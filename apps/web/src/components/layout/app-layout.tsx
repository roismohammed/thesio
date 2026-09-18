import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import {
  adminNavMain,
  defaultDocuments,
  defaultNavSecondary,
  defaultUser,
  userNavMain,
} from "@/components/layout/nav-config"
import { useAuth } from "@/lib/auth-context"
import { usePermission } from "@/hooks/use-permission"
import type { AppLayoutProps } from "@/components/layout/types"

export function AppLayout({
  navMain: navMainProp,
  navSecondary = defaultNavSecondary,
  documents = defaultDocuments,
  brand = "Thesio",
  pageTitle,
  breadcrumb,
  children,
  user: userProp,
}: AppLayoutProps) {
  const { user: authUser, loading } = useAuth()
  const { hasRole } = usePermission()
  const user = userProp ?? (authUser
    ? {
        name: authUser.name,
        email: authUser.email,
        avatar: "",
      }
    : defaultUser)

  const defaultRoleNavMain = hasRole("super admin") ? adminNavMain : userNavMain
  const effectiveNavMain = navMainProp ?? defaultRoleNavMain

  return (
    <SidebarProvider>
      <AppSidebar
        navMain={effectiveNavMain}
        documents={documents}
        navSecondary={navSecondary}
        user={user}
        brand={brand}
        loading={loading}
      />
      <SidebarInset>
        <SiteHeader title={pageTitle} breadcrumb={breadcrumb} />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
