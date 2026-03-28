import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import hi from "./locales/hi.json";
import te from "./locales/te.json";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "hi", "te"],
    debug: false,
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      te: { translation: te },
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
    returnEmptyString: false,
  })
  .then(() => {
    document.documentElement.lang = i18n.resolvedLanguage || "en";
  });

i18n.on("languageChanged", (language) => {
  document.documentElement.lang = language;
});

export default i18n;
