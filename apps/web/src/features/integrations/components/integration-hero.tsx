import { Link } from "react-router-dom"
import { ArrowRight, Sparkles } from "lucide-react"
import { motion } from "motion/react"

import { Button } from "@/components/ui/button"
import { IntegrationNetwork } from "@/features/integrations/components/integration-network"

export function IntegrationHero() {
  return (
    <section className="pt-8 pb-16 md:pt-12 md:pb-20 text-center">
      <div className="max-w-[1140px] mx-auto px-5 sm:px-8 lg:px-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/80 bg-muted/40 text-[11px] font-medium text-muted-foreground mb-4"
        >
          <Sparkles className="size-3 text-primary" />
          <span>Integrasi Lengkap & Otomatis</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-heading text-4xl sm:text-5xl lg:text-5xl font-semibold tracking-tight text-foreground text-balance leading-[1.12]"
        >
          Hubungkan Berbagai Alat Riset & Referensi ke Thesio Secara Gratis
        </motion.h1>

        {/* Supporting text */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto text-balance"
        >
          Satukan manajer referensi, pengolah kata DOCX, notulen bimbingan dosen, dan kalender target sidang tanpa perlu kerja ganda secara manual.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 sm:mt-8 flex justify-center"
        >
          <Button
            size="lg"
            render={<Link to="/register" />}
            className="text-xs sm:text-sm px-7 h-10 font-medium bg-foreground text-background hover:bg-foreground/90 rounded-full gap-2"
          >
            <span>Mulai Integrasi Sekarang</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </motion.div>

        {/* Big Integration Visual Network */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 sm:mt-16"
        >
          <IntegrationNetwork />
        </motion.div>
      </div>
    </section>
  )
}
