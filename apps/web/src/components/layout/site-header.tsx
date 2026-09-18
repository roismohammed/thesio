import { Fragment } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import type { BreadcrumbItem as BreadcrumbItemType } from "@/components/layout/types"

interface SiteHeaderProps {
  title?: string
  breadcrumb?: BreadcrumbItemType[]
}

export function SiteHeader({ title, breadcrumb }: SiteHeaderProps) {
  const { t } = useTranslation()
  const heading = title ?? t("header.titleDefault")

  return (
    <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center gap-2 rounded-t-xl border-b bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <div className="flex w-full items-center gap-1 lg:gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {breadcrumb && breadcrumb.length > 0 ? (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumb.map((item, index) => {
                const isLast = index === breadcrumb.length - 1
                const url = item.url
                return (
                  <Fragment key={`${item.title}-${index}`}>
                    <BreadcrumbItem>
                      {isLast || !url ? (
                        <BreadcrumbPage>{item.title}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink render={<Link to={url} />}>
                          {item.title}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        ) : (
          <h1 className="text-base font-medium leading-5">{heading}</h1>
        )}
        <div className="ml-auto flex items-center gap-1">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}