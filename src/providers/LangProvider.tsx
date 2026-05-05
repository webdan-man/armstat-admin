"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { ContentLangCode } from "@/types/content-entries";

export const LANG_COOKIE = "armstat_lang";
const STORAGE_KEY = "armstat_lang";
const VALID_LANGS: ContentLangCode[] = ["hy", "en", "ru"];
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

type LangContextValue = {
  activeLang: ContentLangCode;
  setActiveLang: (lang: ContentLangCode) => void;
};

const LangContext = createContext<LangContextValue>({
  activeLang: "hy",
  setActiveLang: () => {},
});

function parseLang(value: string | null | undefined): ContentLangCode | null {
  if (value && VALID_LANGS.includes(value as ContentLangCode)) {
    return value as ContentLangCode;
  }
  return null;
}

function getClientCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function getInitialLang(): ContentLangCode {
  if (typeof window === "undefined") return "hy";
  return (
    parseLang(new URLSearchParams(window.location.search).get("lang")) ??
    parseLang(getClientCookie(LANG_COOKIE)) ??
    parseLang(localStorage.getItem(STORAGE_KEY)) ??
    "hy"
  );
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [activeLang, setActiveLangState] = useState<ContentLangCode>("hy");

  useEffect(() => {
    setActiveLangState(getInitialLang());
  }, []);

  const setActiveLang = (lang: ContentLangCode) => {
    setActiveLangState(lang);
    document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
    localStorage.setItem(STORAGE_KEY, lang);
    const params = new URLSearchParams(window.location.search);
    params.set("lang", lang);
    history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  };

  return (
    <LangContext.Provider value={{ activeLang, setActiveLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
