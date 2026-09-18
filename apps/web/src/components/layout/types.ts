import type { ReactNode } from "react"

export interface NavItem {
  title: string
  url: string
  icon: ReactNode
}

export interface NavDocument {
  name: string
  url: string
  icon: ReactNode
}

export interface UserProfile {
  name: string
  email: string
  avatar: string
}

export interface BreadcrumbItem {
  title: string
  url?: string
}

export interface AppSidebarProps {
  navMain: NavItem[]
  documents: NavDocument[]
  navSecondary: NavItem[]
  user: UserProfile
  brand?: string
  loading?: boolean
}

export interface AppLayoutProps {
  navMain?: NavItem[]
  navSecondary?: NavItem[]
  documents?: NavDocument[]
  user?: UserProfile
  brand?: string
  pageTitle: string
  breadcrumb?: BreadcrumbItem[]
  children: ReactNode
}

export function isRouteActive(pathname: string, targetUrl: string): boolean {
  if (targetUrl === "/dashboard" || targetUrl === "/admin") {
    return pathname === targetUrl
  }
  return pathname === targetUrl || pathname.startsWith(`${targetUrl}/`)
}