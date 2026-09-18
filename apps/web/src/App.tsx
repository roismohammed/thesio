import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { ThemeProvider } from "@/components/layout/theme-provider"
import { SidebarVariantProvider } from "@/components/layout/sidebar-variant-provider"
import { AccentColorProvider } from "@/components/layout/accent-color-provider"
import { GuestLayout } from "@/components/layout/guest-layout"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/lib/auth-context"
import { AdminGuard, AuthGuard, GuestGuard, RoleLanding, SubscriptionPermissionGuard } from "@/routes/guards"
import { Toaster } from "@/components/ui/toast"
import { IntegrationsPage } from "@/features/integrations/pages/integrations-page"
import { DasborPage } from "@/features/dasbor/pages/dasbor-page"
import { PengaturanPage } from "@/pages/(authenticated)/pengaturan/pengaturan-page"
import { LoginPage } from "@/features/auth/pages/login"
import { RegisterPage } from "@/features/auth/pages/register"
import { ForgotPasswordPage } from "@/features/auth/pages/forgot-password"
import { ResetPasswordPage } from "@/features/auth/pages/reset-password"
import { AccessDeniedPage } from "@/features/auth/pages/access-denied"
import { AdminPage } from "@/features/admin/pages"
import { AdminUsersPage } from "@/features/admin/pages/users"
import { AdminRolesPage } from "@/features/admin/pages/roles"
import { AdminPermissionsPage } from "@/features/admin/pages/permissions"
import { AdminPlansPage } from "@/features/admin/pages/plans"
import { AdminThesesPage } from "@/features/admin/pages/theses"
import { ProfilePage } from "@/features/profile/pages/profile"
import { BantuanPage } from "@/features/bantuan/pages/bantuan-page"
import { MySubscriptionPage } from "@/features/plan/pages/my-subscription"
import { PlansPage } from "@/features/plan/pages/subscriptions"
import { ThesisPage } from "@/features/thesis/pages/thesis"
import { ThesisDetailPage } from "@/features/thesis/pages/thesis/detail"
import { ChapterPage } from "@/features/thesis/pages/chapter"
import { GuidancePage } from "@/features/thesis/pages/supervision-guide"
import { KanbanTasksPage } from "@/features/thesis/pages/kanban-tasks"

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <SidebarVariantProvider>
          <AccentColorProvider>
            <AuthProvider>
              <Toaster />
              <BrowserRouter>
                <Routes>
                  {/* Public Landing Page / Role-based redirect when authenticated */}
                  <Route path="/" element={<RoleLanding />} />
                  <Route path="/integrations" element={<IntegrationsPage />} />

                  {/* Route group (guest) — tanpa sidebar/header, card terpusat */}
                  <Route element={<GuestLayout />}>
                    <Route
                      path="/login"
                      element={
                        <GuestGuard>
                          <LoginPage />
                        </GuestGuard>
                      }
                    />
                    <Route
                      path="/register"
                      element={
                        <GuestGuard>
                          <RegisterPage />
                        </GuestGuard>
                      }
                    />
                    <Route
                      path="/forgot-password"
                      element={
                        <GuestGuard>
                          <ForgotPasswordPage />
                        </GuestGuard>
                      }
                    />
                    <Route
                      path="/reset-password"
                      element={
                        <GuestGuard>
                          <ResetPasswordPage />
                        </GuestGuard>
                      }
                    />
                  </Route>

                  {/* Route group (authenticated) — AppLayout di-render page-level */}
                  <Route
                    path="/dashboard"
                    element={
                      <AuthGuard>
                        <DasborPage />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/pengaturan"
                    element={
                      <AuthGuard>
                        <PengaturanPage />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/profil"
                    element={
                      <AuthGuard>
                        <ProfilePage />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/bantuan"
                    element={
                      <AuthGuard>
                        <BantuanPage />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/my-subscription"
                    element={
                      <AuthGuard>
                        <MySubscriptionPage />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/plans"
                    element={
                      <AuthGuard>
                        <PlansPage />
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/thesis"
                    element={
                      <SubscriptionPermissionGuard permission="access thesis">
                        <ThesisPage />
                      </SubscriptionPermissionGuard>
                    }
                  />
                  <Route
                    path="/thesis/:thesisId"
                    element={
                      <SubscriptionPermissionGuard permission="access thesis">
                        <ThesisDetailPage />
                      </SubscriptionPermissionGuard>
                    }
                  />
                  <Route
                    path="/thesis/:thesisId/chapters/:chapterId"
                    element={
                      <SubscriptionPermissionGuard permission="access thesis">
                        <ChapterPage />
                      </SubscriptionPermissionGuard>
                    }
                  />
                  <Route
                    path="/thesis/:thesisId/guidance"
                    element={
                      <SubscriptionPermissionGuard permission="access supervision">
                        <GuidancePage />
                      </SubscriptionPermissionGuard>
                    }
                  />
                  <Route
                    path="/thesis/:thesisId/tasks"
                    element={
                      <SubscriptionPermissionGuard permission="access kanban">
                        <KanbanTasksPage />
                      </SubscriptionPermissionGuard>
                    }
                  />

                  {/* Route group (admin) — super admin only */}
                  <Route
                    path="/admin"
                    element={
                      <AdminGuard>
                        <AdminPage />
                      </AdminGuard>
                    }
                  />
                  <Route
                    path="/admin/theses"
                    element={
                      <AdminGuard>
                        <AdminThesesPage />
                      </AdminGuard>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <AdminGuard>
                        <AdminUsersPage />
                      </AdminGuard>
                    }
                  />
                  <Route
                    path="/admin/roles"
                    element={
                      <AdminGuard>
                        <AdminRolesPage />
                      </AdminGuard>
                    }
                  />
                  <Route
                    path="/admin/plans"
                    element={
                      <AdminGuard>
                        <AdminPlansPage />
                      </AdminGuard>
                    }
                  />
                  <Route
                    path="/admin/permissions"
                    element={
                      <AdminGuard>
                        <AdminPermissionsPage />
                      </AdminGuard>
                    }
                  />

                  <Route path="/access-denied" element={<AccessDeniedPage />} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </AuthProvider>
          </AccentColorProvider>
        </SidebarVariantProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
