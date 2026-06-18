"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function HeaderSearchButton({ className = "" }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <Link
      href="/stat/"
      className={`flex cursor-pointer items-center outline-none ${className}`}
      aria-label={t("stat.search_action", "Որոնել")}
    >
      <Image src="/icons/search.svg" alt="" width={24} height={24} aria-hidden />
    </Link>
  );
}
