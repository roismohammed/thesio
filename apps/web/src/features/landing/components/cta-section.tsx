import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { motion } from "motion/react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export function CtaSection() {
  const { user } = useAuth()

  return (
    <section className="py-16 md:py-20 border-t border-border/60 text-center">
      <div className="max-w-[760px] mx-auto px-6 sm:px-8 lg:px-10 flex flex-col items-center">
        <motion.img
          src="/logo/thesio.png"
          alt="Thesio"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="size-10 rounded-lg object-contain mb-5"
        />

        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-balance leading-tight text-foreground"
        >
          Alur kerja skripsi yang teratur dimulai dari sini
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="mt-3.5 text-sm sm:text-base text-muted-foreground max-w-lg text-balance leading-relaxed"
        >
          Bergabunglah dengan mahasiswa lainnya yang telah mengubah stres skripsi menjadi progres harian yang nyata.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.55, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 flex flex-col sm:flex-row items-center gap-3"
        >
          <Button
            size="lg"
            render={<Link to={user ? "/dashboard" : "/register"} />}
            className="text-xs sm:text-sm px-8 h-10 font-medium bg-foreground text-background hover:bg-foreground/90 gap-2"
          >
            <span>{user ? "Masuk ke Dasbor Saya" : "Mulai Gratis Sekarang"}</span>
            <ArrowRight className="size-3.5" />
          </Button>
          {!user && (
            <Button
              size="lg"
              variant="outline"
              render={<Link to="/login" />}
              className="text-xs sm:text-sm px-6 h-10 font-medium border-border/80 text-foreground"
            >
              Masuk ke Akun
            </Button>
          )}
        </motion.div>
      </div>
    </section>
  )
}
