"use client";

import React from "react";

import type { MainLangCode } from "@/components/main/main-mock-data";
import { cn } from "@/lib/utils";

const LANGS: { code: MainLangCode; label: string }[] = [
  { code: "am", label: "AM" },
  { code: "ru", label: "RU" },
  { code: "en", label: "ENG" },
];

type LangSwitcherProps = {
  value: MainLangCode;
  onChange: (code: MainLangCode) => void;
  className?: string;
};

export function LangSwitcher({ value, onChange, className }: LangSwitcherProps) {
  return (
    <div
      className={cn(
        "inline-flex h-9 shrink-0 items-center rounded-[9px] bg-[#e6e7eb] p-0.5",
        className
      )}
      role="tablist"
      aria-label="Լեզու"
    >
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          role="tab"
          aria-selected={value === code}
          className={cn(
            "h-8 min-w-[64px] rounded-lg px-2 text-[13px] transition-colors",
            value === code
              ? "bg-white text-black shadow-[0px_4px_4px_0px_rgba(0,0,0,0.05)]"
              : "bg-transparent text-black hover:bg-white/50"
          )}
          onClick={() => onChange(code)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
