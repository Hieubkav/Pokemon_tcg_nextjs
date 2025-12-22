"use client";

import { createContext, useContext, useSyncExternalStore, ReactNode } from "react";
import en from "@/messages/en.json";
import vi from "@/messages/vi.json";

type Locale = "en" | "vi";
type Messages = typeof en;

interface LocaleContextType {
  locale: Locale;
  t: (key: string) => string;
}

const messages: Record<Locale, Messages> = { en, vi };

const LocaleContext = createContext<LocaleContextType | null>(null);

function detectLocale(): Locale {
  if (typeof window === "undefined") return "en";
  
  // Check timezone (Vietnam = Asia/Ho_Chi_Minh or Asia/Saigon)
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timezone === "Asia/Ho_Chi_Minh" || timezone === "Asia/Saigon") {
    return "vi";
  }
  
  // Check browser language
  const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || "";
  if (browserLang.startsWith("vi")) {
    return "vi";
  }
  
  return "en";
}

function subscribe() {
  return () => {};
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, detectLocale, () => "en" as Locale);

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: unknown = messages[locale];
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    return typeof value === "string" ? value : key;
  };

  return (
    <LocaleContext.Provider value={{ locale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
