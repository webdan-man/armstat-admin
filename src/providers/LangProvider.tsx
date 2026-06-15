"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LANG_COOKIE,
  LANG_STORAGE_KEY,
  defaultLocale,
  parseLocale,
  type Locale,
} from "@/lib/i18n";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

type LangContextValue = {
  activeLang: Locale;
  setActiveLang: (lang: Locale) => void;
  /** False until the persisted locale has been resolved on the client. */
  ready: boolean;
};

const LangContext = createContext<LangContextValue>({
  activeLang: defaultLocale,
  setActiveLang: () => {},
  ready: false,
});

function getClientCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Client locale priority: URL ?lang= → cookie → localStorage → default. */
function getInitialLang(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  return (
    parseLocale(new URLSearchParams(window.location.search).get("lang")) ??
    parseLocale(getClientCookie(LANG_COOKIE)) ??
    parseLocale(localStorage.getItem(LANG_STORAGE_KEY)) ??
    defaultLocale
  );
}

export function LangProvider({
  children,
  initialLang = defaultLocale,
}: {
  children: React.ReactNode;
  /** Locale resolved on the server (URL ?lang= → cookie → default) to seed first render. */
  initialLang?: Locale;
}) {
  const router = useRouter();
  const pathname = usePathname();
  // Seeded from the server so the first paint already uses the right locale —
  // no default→actual flash on load.
  const [activeLang, setActiveLangState] = useState<Locale>(initialLang);
  const [ready, setReady] = useState(true);

  useEffect(() => {
    // Reconcile with client-only sources (localStorage / a ?lang= the layout
    // can't read). Normally matches the server value, so no visible change.
    const clientLang = getInitialLang();
    if (clientLang !== initialLang) setActiveLangState(clientLang);
    setReady(true);
  }, [initialLang]);

  const setActiveLang = (lang: Locale) => {
    setActiveLangState(lang);
    document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    const params = new URLSearchParams(window.location.search);
    params.set("lang", lang);
    // Navigate through the Next router (not history.replaceState) so server
    // components re-render and re-resolve the locale for SSR'd content.
    router.replace(`${pathname}?${params.toString()}`);
    router.refresh();
  };

  return (
    <LangContext.Provider value={{ activeLang, setActiveLang, ready }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
