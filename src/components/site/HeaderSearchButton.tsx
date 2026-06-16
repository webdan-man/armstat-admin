"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { Input } from "@/components/ui/input";

export default function HeaderSearchButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const submitSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setOpen(false);
    setQuery("");
    router.push(`/stat/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitSearch();
    }
    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex cursor-pointer items-center gap-2.5 outline-none ${className}`}
      >
        <span className="text-[14px] text-white/60">{t("stat.search_action", "Որոնել")}</span>
        <Image src="/icons/search.svg" alt="" width={24} height={24} aria-hidden />
      </button>
      {open ? (
        <div className="absolute top-full right-0 z-50 mt-2 w-[min(673px,calc(100vw-2.5rem))]">
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={t("stat.search_action", "Որոնել")}
            className="border-textBlack300 h-10.5 w-full bg-white text-[rgba(55,71,79,1)] shadow-none"
          />
        </div>
      ) : null}
    </div>
  );
}
