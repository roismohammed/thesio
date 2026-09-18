import { useEffect } from "react"

import i18n from "@/i18n/config"

export function useDocumentLang(): void {
  useEffect(() => {
    const apply = (lng: string) => {
      const lang = lng.split("-")[0] ?? "id"
      document.documentElement.lang = lang
    }

    apply(i18n.language ?? "id")

    const handler = (lng: string) => apply(lng)
    i18n.on("languageChanged", handler)

    return () => {
      i18n.off("languageChanged", handler)
    }
  }, [])
}