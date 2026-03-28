import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const LANGUAGES = [
  { code: "en", labelKey: "language.english" },
  { code: "hi", labelKey: "language.hindi" },
  { code: "te", labelKey: "language.telugu" },
] as const;

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.resolvedLanguage ?? i18n.language;

  return (
    <div className="flex flex-wrap gap-2">
      {LANGUAGES.map((language) => {
        const isActive = currentLanguage === language.code;

        return (
          <Button
            key={language.code}
            size="sm"
            variant={isActive ? "default" : "outline"}
            onClick={() => void i18n.changeLanguage(language.code)}
          >
            {t(language.labelKey)}
          </Button>
        );
      })}
    </div>
  );
}
