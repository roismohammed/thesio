import type { CSSProperties } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar"

export function SidebarHeaderSkeleton() {
  return (
    <SidebarHeader className="border-b border-sidebar-border p-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex h-10 items-center gap-2.5 px-2">
            <Skeleton className="size-6 rounded-md bg-sidebar-muted shimmer" />
            <Skeleton className="h-4 w-28 rounded bg-sidebar-muted shimmer" />
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}

export function NavMainSkeleton({ count = 4 }: { count?: number }) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {Array.from({ length: count }).map((_, i) => (
            <SidebarMenuItem
              key={i}
              className="animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-both motion-reduce:animate-none"
              style={{ animationDelay: `${i * 45}ms` } as CSSProperties}
            >
              <SidebarMenuSkeleton
                showIcon
                className="shimmer rounded-lg"
              />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function NavSecondarySkeleton({ count = 2 }: { count?: number }) {
  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {Array.from({ length: count }).map((_, i) => (
            <SidebarMenuItem
              key={i}
              className="animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-both motion-reduce:animate-none"
              style={{ animationDelay: `${(i + 4) * 45}ms` } as CSSProperties}
            >
              <SidebarMenuSkeleton
                showIcon
                className="shimmer rounded-lg"
              />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function NavUserSkeleton() {
  return (
    <SidebarFooter className="border-t border-sidebar-border p-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex h-12 items-center gap-2.5 rounded-lg px-2">
            <Skeleton className="size-8 rounded-full bg-sidebar-muted shimmer shrink-0" />
            <div className="flex flex-1 flex-col gap-1.5 min-w-0">
              <Skeleton className="h-3.5 w-24 rounded bg-sidebar-muted shimmer" />
              <Skeleton className="h-2.5 w-32 rounded bg-sidebar-muted shimmer" />
            </div>
            <Skeleton className="size-4 rounded bg-sidebar-muted shimmer shrink-0" />
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  )
}

export function AppSidebarSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-10 flex flex-col bg-sidebar select-none pointer-events-none motion-reduce:animate-none"
    >
      <SidebarHeaderSkeleton />
      <SidebarContent className="p-2 gap-4">
        <NavMainSkeleton count={4} />
        <NavSecondarySkeleton count={2} />
      </SidebarContent>
      <NavUserSkeleton />
    </div>
  )
}
