import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ar from "./locales/ar.json";
import en from "./locales/en.json";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            ar: { translation: ar },
            en: { translation: en },
        },
        fallbackLng: "ar",
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ["localStorage", "cookie", "navigatror"],
            caches: ["localStorage", "cookie"],
        },
    });

// Set initial direction
const dir = i18n.language === "ar" ? "rtl" : "ltr";
document.documentElement.dir = dir;
document.documentElement.lang = i18n.language;

i18n.on("languageChanged", (lng) => {
    const newDir = lng === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = newDir;
    document.documentElement.lang = lng;
});

export default i18n;
