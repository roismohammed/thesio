import { motion } from "motion/react"

const LOGO_ITEMS = [
  { name: "Universitas Trunojoyo Madura", src: "/logo/logo UTM.jpeg" },
  { name: "Triple-C", src: "/logo/LOGO TRIPLE-C.png" },
  { name: "TCC", src: "/logo/LOGO TCC.png" },
  { name: "Jack", src: "/logo/JACK 2.png" },
  { name: "Universitas Trunojoyo Madura", src: "/logo/logo UTM.jpeg" },
  { name: "Triple-C", src: "/logo/LOGO TRIPLE-C.png" },
  { name: "TCC", src: "/logo/LOGO TCC.png" },
  { name: "Jack", src: "/logo/JACK 2.png" },
  { name: "Universitas Trunojoyo Madura", src: "/logo/logo UTM.jpeg" },
  { name: "Triple-C", src: "/logo/LOGO TRIPLE-C.png" },
  { name: "TCC", src: "/logo/LOGO TCC.png" },
  { name: "Jack", src: "/logo/JACK 2.png" },
  { name: "Universitas Trunojoyo Madura", src: "/logo/logo UTM.jpeg" },
  { name: "Triple-C", src: "/logo/LOGO TRIPLE-C.png" },
  { name: "TCC", src: "/logo/LOGO TCC.png" },
  { name: "Jack", src: "/logo/JACK 2.png" },
]

export function TrustedMarquee() {
  return (
    <section className="py-10 border-y border-border/60 bg-muted/15 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-10 text-center mb-6">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Dirancang Sesuai Standar Pedoman Akademik Seluruh Universitas di Indonesia
        </p>
      </div>

      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex items-center gap-12 sm:gap-20 w-max hover:[animation-play-state:paused]"
        >
          {LOGO_ITEMS.map((logo, idx) => (
            <div
              key={`${logo.name}-${idx}`}
              className="group flex items-center gap-3 sm:gap-4 shrink-0 cursor-default"
            >
              <img
                src={logo.src}
                alt={logo.name}
                className="h-9 sm:h-11 w-auto max-w-[50px] sm:max-w-[60px] object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-200"
                loading="lazy"
              />
              <span className="text-sm sm:text-base font-semibold font-mono text-muted-foreground/80 group-hover:text-foreground transition-colors whitespace-nowrap">
                {logo.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
