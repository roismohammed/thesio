import { useHead, useSeoMeta as useUnheadSeoMeta } from "@unhead/react"
import { useTranslation } from "react-i18next"

import { SITE_NAME, SITE_URL } from "@/lib/site"

interface SeoMetaOptions {
  title?: string
  description?: string
  path?: string
  image?: string
}

const DEFAULT_IMAGE = `${SITE_URL}/og-image.svg`

const LOCALE_MAP: Record<string, string> = {
  id: "id_ID",
  en: "en_US",
}

function resolveOgLocale(language: string): string {
  return LOCALE_MAP[language] ?? "id_ID"
}

function buildUrl(path: string): string {
  if (!path || path === "/") return `${SITE_URL}/`
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

export function useSeoMeta({
  title = "",
  description,
  path = "/",
  image = DEFAULT_IMAGE,
}: SeoMetaOptions = {}): void {
  const { i18n } = useTranslation()
  const activeLanguage = i18n.language ?? "id"
  const ogLocale = resolveOgLocale(activeLanguage)
  const canonicalUrl = buildUrl(path)
  const resolvedTitle = title || SITE_NAME
  const documentTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME

  useUnheadSeoMeta({
    title: documentTitle,
    description,
    ogTitle: resolvedTitle,
    ogDescription: description,
    ogImage: image,
    ogUrl: canonicalUrl,
    ogType: "website",
    ogSiteName: SITE_NAME,
    ogLocale,
    twitterCard: "summary_large_image",
    twitterTitle: resolvedTitle,
    twitterDescription: description,
    twitterImage: image,
  })

  useHead({
    link: [{ rel: "canonical", href: canonicalUrl }],
  })
}