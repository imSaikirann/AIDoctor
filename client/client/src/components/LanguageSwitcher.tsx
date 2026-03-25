import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const activeLanguage = i18n.resolvedLanguage ?? i18n.language;

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={activeLanguage?.startsWith("en") ? "default" : "outline"}
        onClick={() => i18n.changeLanguage("en")}
      >
        EN
      </Button>

      <Button
        size="sm"
        variant={activeLanguage?.startsWith("hi") ? "default" : "outline"}
        onClick={() => i18n.changeLanguage("hi")}
      >
        {t("language.hi")}
      </Button>

      <Button
        size="sm"
        variant={activeLanguage?.startsWith("te") ? "default" : "outline"}
        onClick={() => i18n.changeLanguage("te")}
      >
        {t("language.te")}
      </Button>
    </div>
  );
}
