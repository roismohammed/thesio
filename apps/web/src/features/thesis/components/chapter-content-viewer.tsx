import type { ReactNode } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"
import type { ChapterAnnotation } from "@/features/thesis/types"

interface ChapterContentViewerProps {
  content: string
  annotations?: ChapterAnnotation[]
  className?: string
}

const STABILO_CLASSES: Record<string, string> = {
  yellow: "bg-yellow-200 text-yellow-950 dark:bg-yellow-900/70 dark:text-yellow-100 rounded px-1 py-0.5",
  green: "bg-green-200 text-green-950 dark:bg-green-900/70 dark:text-green-100 rounded px-1 py-0.5",
  blue: "bg-blue-200 text-blue-950 dark:bg-blue-900/70 dark:text-blue-100 rounded px-1 py-0.5",
  pink: "bg-pink-200 text-pink-950 dark:bg-pink-900/70 dark:text-pink-100 rounded px-1 py-0.5",
  orange: "bg-orange-200 text-orange-950 dark:bg-orange-900/70 dark:text-orange-100 rounded px-1 py-0.5",
}

function renderTextWithAnnotations(text: string, annotations: ChapterAnnotation[]): ReactNode {
  if (!annotations.length || !text) return text

  const activeAnnotations = annotations.filter(
    (a) => a.selected_text && a.selected_text.trim().length > 0 && text.includes(a.selected_text.trim()),
  )

  if (!activeAnnotations.length) return text

  let parts: ReactNode[] = [text]

  activeAnnotations.forEach((ann) => {
    const target = ann.selected_text.trim()
    const newParts: ReactNode[] = []

    parts.forEach((part, partIdx) => {
      if (typeof part !== "string") {
        newParts.push(part)
        return
      }

      const split = part.split(target)
      split.forEach((subText, subIdx) => {
        if (subText) newParts.push(subText)
        if (subIdx < split.length - 1) {
          const colorClass = STABILO_CLASSES[ann.color] ?? STABILO_CLASSES.yellow
          newParts.push(
            <mark
              key={`ann-${ann.id}-${partIdx}-${subIdx}`}
              className={cn(colorClass, "cursor-pointer transition-opacity hover:opacity-80")}
              title={ann.comment ? `${ann.author_name ?? "Catatan"}: ${ann.comment}` : "Sorotan Stabilo"}
            >
              {target}
            </mark>,
          )
        }
      })
    })

    parts = newParts
  })

  return <>{parts}</>
}

export function ChapterContentViewer({
  content,
  annotations = [],
  className,
}: ChapterContentViewerProps) {
  return (
    <div
      className={cn(
        "prose prose-neutral max-w-none dark:prose-invert font-sans text-base leading-relaxed selection:bg-primary/20",
        "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:mt-6 [&_h1]:mb-4",
        "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:mt-5 [&_h2]:mb-3",
        "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2",
        "[&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-foreground",
        "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4",
        "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4",
        "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
        "[&_table]:w-full [&_table]:my-4 [&_table]:border-collapse",
        "[&_td]:border [&_td]:border-border [&_td]:p-2.5 [&_th]:border [&_th]:border-border [&_th]:p-2.5 [&_th]:bg-muted/50",
        "[&_code:not(pre_code)]:bg-muted [&_code:not(pre_code)]:px-1.5 [&_code:not(pre_code)]:py-0.5 [&_code:not(pre_code)]:rounded [&_code:not(pre_code)]:text-sm [&_code:not(pre_code)]:font-mono",
        "[&_pre]:bg-muted/60 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p>
              {Array.isArray(children)
                ? children.map((c, i) =>
                    typeof c === "string" ? (
                      <span key={i}>{renderTextWithAnnotations(c, annotations)}</span>
                    ) : (
                      c
                    ),
                  )
                : typeof children === "string"
                  ? renderTextWithAnnotations(children, annotations)
                  : children}
            </p>
          ),
          li: ({ children }) => (
            <li>
              {Array.isArray(children)
                ? children.map((c, i) =>
                    typeof c === "string" ? (
                      <span key={i}>{renderTextWithAnnotations(c, annotations)}</span>
                    ) : (
                      c
                    ),
                  )
                : typeof children === "string"
                  ? renderTextWithAnnotations(children, annotations)
                  : children}
            </li>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
