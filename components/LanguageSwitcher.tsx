"use client";

import { useI18n, Language } from "./I18nProvider";

const langs: { id: Language; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "ru", label: "RU" },
  { id: "uk", label: "UA" },
];

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useI18n();

  return (
    <div className={`flex items-center rounded-xl border border-white/[0.08] bg-white/[0.035] p-1 ${compact ? "gap-0" : "gap-0.5"}`}>
      {langs.map((lang) => (
        <button
          key={lang.id}
          onClick={() => setLanguage(lang.id)}
          className={`rounded-lg px-2 py-1.5 text-[10px] font-bold tracking-[.06em] transition ${
            language === lang.id ? "bg-[#F5C344] text-[#111820]" : "text-white/45 hover:text-white"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
