import { useState } from "react"
import {
  BookOpen,
  Calendar,
  Check,
  Cloud,
  FileCheck,
  FileCode,
  FileEdit,
  FileText,
  Languages,
  MessageSquare,
} from "lucide-react"
import { motion } from "motion/react"

import type {
  IntegrationIconType,
  IntegrationItem,
} from "@/features/integrations/data/integrations"

interface IntegrationCardProps {
  item: IntegrationItem
}

function renderIntegrationIcon(type: IntegrationIconType) {
  switch (type) {
    case "mendeley":
      return <BookOpen className="size-5 text-sky-600 dark:text-sky-400" />
    case "gdrive":
      return <Cloud className="size-5 text-amber-600 dark:text-amber-400" />
    case "word":
      return <FileText className="size-5 text-blue-600 dark:text-blue-400" />
    case "whatsapp":
      return <MessageSquare className="size-5 text-emerald-600 dark:text-emerald-400" />
    case "ai":
      return <Languages className="size-5 text-violet-600 dark:text-violet-400" />
    case "calendar":
      return <Calendar className="size-5 text-rose-600 dark:text-rose-400" />
    case "turnitin":
      return <FileCheck className="size-5 text-teal-600 dark:text-teal-400" />
    case "latex":
      return <FileCode className="size-5 text-indigo-600 dark:text-indigo-400" />
    case "notulen":
      return <FileEdit className="size-5 text-emerald-600 dark:text-emerald-400" />
    default:
      return <FileText className="size-5 text-primary" />
  }
}

export function IntegrationCard({ item }: IntegrationCardProps) {
  const [connected, setConnected] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col justify-between rounded-xl bg-card border border-border p-5 sm:p-6 hover:border-border/80 transition-all duration-200"
    >
      <div className="flex flex-col items-center text-center">
        {/* Icon & Category */}
        <div className="size-12 rounded-xl bg-muted/60 border border-border/80 flex items-center justify-center mb-3.5">
          {renderIntegrationIcon(item.iconType)}
        </div>

        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          {item.category}
        </span>

        {/* Title */}
        <h3 className="font-heading text-base sm:text-lg font-semibold tracking-tight text-foreground">
          {item.name}
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Connect Action Button */}
      <div className="mt-5 pt-4 border-t border-border/50 flex justify-center">
        <button
          type="button"
          onClick={() => setConnected(!connected)}
          className={`w-full sm:w-auto min-w-[120px] inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
            connected
              ? "bg-primary text-primary-foreground border border-primary"
              : "bg-background hover:bg-muted/60 text-foreground border border-border/80"
          }`}
        >
          {connected ? (
            <>
              <Check className="size-3.5" />
              <span>Terhubung</span>
            </>
          ) : (
            <span>Hubungkan</span>
          )}
        </button>
      </div>
    </motion.div>
  )
}
