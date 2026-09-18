import type { ComponentProps } from "react"
import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { isRouteActive, type NavItem } from "@/components/layout/types"

interface NavSecondaryProps {
  items: NavItem[]
  className?: string
}

export function NavSecondary({
  items,
  className,
  ...props
}: NavSecondaryProps & ComponentProps<typeof SidebarGroup>) {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <SidebarGroup className={className} {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const label = t(item.title)
            const isActive = isRouteActive(location.pathname, item.url)
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  isActive={isActive}
                  render={<Link to={item.url} />}
                >
                  {item.icon}
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}