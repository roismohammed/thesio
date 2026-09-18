import { Sparkles } from "lucide-react"
import { motion } from "motion/react"

import { INTEGRATIONS_LIST } from "@/features/integrations/data/integrations"
import { IntegrationCard } from "@/features/integrations/components/integration-card"

export function IntegrationGrid() {
  return (
    <section className="py-16 md:py-20 border-t border-border/60 bg-muted/10">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/80 bg-muted/40 text-[11px] font-medium text-muted-foreground mb-3"
          >
            <Sparkles className="size-3 text-primary" />
            <span>Integrasi Langsung</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight text-foreground text-balance"
          >
            Integrasi Bawaan yang Langsung Siap Pakai
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed text-balance"
          >
            Dirancang khusus untuk kebutuhan penulisan karya ilmiah: cepat, aman, dan tanpa instalasi rumit.
          </motion.p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {INTEGRATIONS_LIST.map((item) => (
            <IntegrationCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
