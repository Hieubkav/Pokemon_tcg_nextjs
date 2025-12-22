"use client";

import { createContext, useContext, useState, useSyncExternalStore, ReactNode } from "react";
import en from "@/messages/en.json";
import vi from "@/messages/vi.json";

type Locale = "en" | "vi";
type Messages = typeof en;

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const messages: Record<Locale, Messages> = { en, vi };

const LocaleContext = createContext<LocaleContextType | null>(null);

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "vi";
  const saved = localStorage.getItem("locale") as Locale;
  return saved === "en" || saved === "vi" ? saved : "vi";
}

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const storedLocale = useSyncExternalStore(subscribeToStorage, getStoredLocale, () => "vi" as Locale);
  const [locale, setLocaleState] = useState<Locale>(storedLocale);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
  };

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
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
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
