import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Mail01Icon,
  PlusSignCircleIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { isRouteActive, type NavItem } from "@/components/layout/types"

interface NavMainProps {
  items: NavItem[]
}

export function NavMain({ items }: NavMainProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const quickCreate = t("nav.quickCreate")
  const inbox = t("nav.inbox")

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip={quickCreate}
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              <HugeiconsIcon icon={PlusSignCircleIcon} strokeWidth={2} />
              <span>{quickCreate}</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
              aria-label={inbox}
            >
              <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} />
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const label = t(item.title)
            const isActive = isRouteActive(location.pathname, item.url)
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={label}
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