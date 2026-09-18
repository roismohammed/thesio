import { Link } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useSidebarVariant } from "@/components/layout/use-sidebar-variant"
import { NavDocuments } from "@/components/layout/nav-documents"
import { NavMain } from "@/components/layout/nav-main"
import { NavSecondary } from "@/components/layout/nav-secondary"
import { NavUser } from "@/components/layout/nav-user"
import { AppSidebarSkeleton } from "@/components/layout/app-sidebar-skeleton"
import { useDeferredUnmount } from "@/hooks/use-deferred-unmount"
import type { AppSidebarProps } from "@/components/layout/types"

export function AppSidebar({
  navMain,
  documents,
  navSecondary,
  user,
  brand = "Thesio",
  loading = false,
}: AppSidebarProps) {
  const { variant } = useSidebarVariant()
  const showSkeleton = useDeferredUnmount(loading, 280)

  return (
    <Sidebar collapsible="offcanvas" variant={variant}>
      {showSkeleton ? (
        <div
          className={`absolute inset-0 z-10 bg-sidebar ${
            !loading
              ? "animate-out fade-out duration-300 fill-mode-both motion-reduce:animate-none"
              : ""
          }`}
        >
          <AppSidebarSkeleton />
        </div>
      ) : null}

      <div
        className={`flex h-full w-full flex-col ${
          loading ? "invisible" : ""
        }`}
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link to="/dashboard" />}
                className="data-[slot=sidebar-menu-button]:p-1.5!"
              >
                <img
                  src="/logo/thesio.png"
                  alt={brand}
                  className="size-5 rounded object-contain shrink-0"
                />
                <span className="text-base font-semibold">{brand}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={navMain} />
          <NavDocuments items={documents} />
          <NavSecondary items={navSecondary} className="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
      </div>
    </Sidebar>
  )
}
