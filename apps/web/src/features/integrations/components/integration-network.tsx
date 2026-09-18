import {
  BookOpen,
  Calendar,
  Cloud,
  FileCode,
  FileEdit,
  FileText,
  Languages,
  MessageSquare,
} from "lucide-react"
import { motion } from "motion/react"

export function IntegrationNetwork() {
  const nodes = [
    {
      name: "Mendeley & Zotero",
      icon: <BookOpen className="size-4 text-sky-600 dark:text-sky-400" />,
      pos: "top-4 left-4 sm:top-6 sm:left-10",
      delay: 0.35,
    },
    {
      name: "Microsoft Word",
      icon: <FileText className="size-4 text-blue-600 dark:text-blue-400" />,
      pos: "top-4 right-4 sm:top-6 sm:right-10",
      delay: 0.4,
    },
    {
      name: "Google Drive",
      icon: <Cloud className="size-4 text-amber-600 dark:text-amber-400" />,
      pos: "bottom-4 left-4 sm:bottom-6 sm:left-10",
      delay: 0.45,
    },
    {
      name: "Google Calendar",
      icon: <Calendar className="size-4 text-rose-600 dark:text-rose-400" />,
      pos: "bottom-4 right-4 sm:bottom-6 sm:right-10",
      delay: 0.5,
    },
    {
      name: "AI Tata Bahasa",
      icon: <Languages className="size-4 text-violet-600 dark:text-violet-400" />,
      pos: "top-1/2 -translate-y-1/2 left-2 sm:left-4",
      delay: 0.55,
    },
    {
      name: "WhatsApp Notifikasi",
      icon: <MessageSquare className="size-4 text-emerald-600 dark:text-emerald-400" />,
      pos: "top-1/2 -translate-y-1/2 right-2 sm:right-4",
      delay: 0.6,
    },
    {
      name: "Overleaf & BibTeX",
      icon: <FileCode className="size-4 text-indigo-600 dark:text-indigo-400" />,
      pos: "top-1 sm:top-2 left-1/2 -translate-x-1/2",
      delay: 0.65,
    },
    {
      name: "Notulen Bimbingan",
      icon: <FileEdit className="size-4 text-teal-600 dark:text-teal-400" />,
      pos: "bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2",
      delay: 0.7,
    },
  ]

  return (
    <div className="relative w-full max-w-[680px] h-[320px] sm:h-[380px] md:h-[420px] mx-auto rounded-2xl bg-muted/20 border border-border/70 overflow-hidden flex items-center justify-center p-4 sm:p-8">
      {/* Animated Dotted Background */}
      <motion.div
        animate={{
          backgroundPosition: ["0px 0px", "24px 24px"],
        }}
        transition={{
          repeat: Infinity,
          duration: 18,
          ease: "linear",
        }}
        className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          color: "var(--muted-foreground)",
        }}
      />

      {/* SVG Connecting Lines from Center (50% 50%) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.2" strokeDasharray="3 3">
          <line x1="50%" y1="50%" x2="16%" y2="18%" />
          <line x1="50%" y1="50%" x2="84%" y2="18%" />
          <line x1="50%" y1="50%" x2="16%" y2="82%" />
          <line x1="50%" y1="50%" x2="84%" y2="82%" />
          <line x1="50%" y1="50%" x2="10%" y2="50%" />
          <line x1="50%" y1="50%" x2="90%" y2="50%" />
          <line x1="50%" y1="50%" x2="50%" y2="12%" />
          <line x1="50%" y1="50%" x2="50%" y2="88%" />
        </g>
      </svg>

      {/* Center Brand Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 size-16 sm:size-20 rounded-2xl bg-card border-2 border-border p-3 flex items-center justify-center"
      >
        <img
          src="/logo/thesio.png"
          alt="Thesio Central Logo"
          className="size-10 sm:size-12 object-contain rounded-lg"
        />
      </motion.div>

      {/* Surrounding Nodes */}
      {nodes.map((node, idx) => (
        <motion.div
          key={idx}
          initial={{ scale: 0.7, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: node.delay, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute ${node.pos} z-10 flex items-center gap-2 p-1.5 sm:p-2 rounded-xl bg-card border border-border text-foreground select-none hover:border-border/80 transition-colors`}
        >
          <div className="size-6 sm:size-7 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
            {node.icon}
          </div>
          <span className="text-[11px] font-medium hidden sm:inline-block pr-1">
            {node.name}
          </span>
        </motion.div>
      ))}
    </div>
  )
}
