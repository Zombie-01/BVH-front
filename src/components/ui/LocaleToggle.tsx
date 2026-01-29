import { useLocale } from "@/contexts/LocaleContext";
import { Globe } from "lucide-react";

interface LocaleToggleProps {
  isScrolled?: boolean;
}

export const LocaleToggle = ({ isScrolled = false }: LocaleToggleProps) => {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={`flex items-center gap-1 p-1 rounded-lg transition-colors ${
        isScrolled ? "bg-muted" : "bg-primary-foreground/10"
      }`}>
      <button
        onClick={() => setLocale("en")}
        className={`px-2 py-1 text-xs font-semibold rounded transition-all ${
          locale === "en"
            ? "bg-accent text-accent-foreground"
            : isScrolled
            ? "text-muted-foreground hover:text-foreground"
            : "text-primary-foreground/70 hover:text-primary-foreground"
        }`}>
        EN
      </button>
      <button
        onClick={() => setLocale("mn")}
        className={`px-2 py-1 text-xs font-semibold rounded transition-all ${
          locale === "mn"
            ? "bg-accent text-accent-foreground"
            : isScrolled
            ? "text-muted-foreground hover:text-foreground"
            : "text-primary-foreground/70 hover:text-primary-foreground"
        }`}>
        MN
      </button>
    </div>
  );
};
