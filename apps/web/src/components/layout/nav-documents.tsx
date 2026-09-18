import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete02Icon,
  Folder01Icon,
  MoreHorizontalCircle01Icon,
  Share01Icon,
} from "@hugeicons/core-free-icons"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { isRouteActive, type NavDocument } from "@/components/layout/types"

interface NavDocumentsProps {
  items: NavDocument[]
}

export function NavDocuments({ items }: NavDocumentsProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const { isMobile } = useSidebar()
  const more = t("nav.documents.more")

  if (items.length === 0) {
    return null
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{t("nav.documents.label")}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const label = t(item.name)
          const isActive = isRouteActive(location.pathname, item.url)
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                isActive={isActive}
                render={<Link to={item.url} />}
              >
                {item.icon}
                <span>{label}</span>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuAction
                      showOnHover
                      className="rounded-sm data-[state=open]:bg-accent"
                    />
                  }
                >
                  <HugeiconsIcon icon={MoreHorizontalCircle01Icon} strokeWidth={2} />
                  <span className="sr-only">{more}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-24 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem>
                    <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />
                    <span>{t("nav.documents.open")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HugeiconsIcon icon={Share01Icon} strokeWidth={2} />
                    <span>{t("nav.documents.share")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">
                    <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                    <span>{t("nav.documents.delete")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )
        })}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <HugeiconsIcon
              icon={MoreHorizontalCircle01Icon}
              strokeWidth={2}
              className="text-sidebar-foreground/70"
            />
            <span>{more}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}