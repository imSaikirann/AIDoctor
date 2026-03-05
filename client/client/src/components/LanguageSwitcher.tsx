import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => i18n.changeLanguage("en")}>
        EN
      </Button>

      <Button size="sm" onClick={() => i18n.changeLanguage("hi")}>
        हिन्दी
      </Button>

      <Button size="sm" onClick={() => i18n.changeLanguage("te")}>
        తెలుగు
      </Button>
    </div>
  );
}