import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import idCommon from "./locales/id/common.json"
import enCommon from "./locales/en/common.json"
import idThesis from "./locales/id/thesis.json"
import enThesis from "./locales/en/thesis.json"

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "id",
    supportedLngs: ["id", "en"],
    ns: ["common", "thesis"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "thesio.lang",
      caches: ["localStorage"],
    },
    resources: {
      id: { common: idCommon, thesis: idThesis },
      en: { common: enCommon, thesis: enThesis },
    },
  })

export default i18n