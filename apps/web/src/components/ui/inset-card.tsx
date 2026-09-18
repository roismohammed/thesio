import * as React from "react"
import { cn } from "@/lib/utils"

function InsetCard({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="inset-card"
      className={cn(
        "flex flex-col rounded-xl border bg-muted/60 p-2 shadow-2xs transition-colors",
        className
      )}
      {...props}
    />
  )
}

function InsetCardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="inset-card-header"
      className={cn("px-2 pt-1 pb-2", className)}
      {...props}
    />
  )
}

function InsetCardTitle({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="inset-card-title"
      className={cn("text-sm font-semibold tracking-tight text-foreground", className)}
      {...props}
    />
  )
}

function InsetCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="inset-card-content"
      className={cn(
        "flex flex-1 flex-col gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-2xs",
        className
      )}
      {...props}
    />
  )
}

export {
  InsetCard,
  InsetCardHeader,
  InsetCardTitle,
  InsetCardContent,
}
