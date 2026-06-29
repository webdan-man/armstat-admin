"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

type StatBackButtonProps = {
  href?: string | null;
  className?: string;
};

export default function StatBackButton({ href, className }: StatBackButtonProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => {
        if (href) router.push(href);
        else router.back();
      }}
      className={cn("flex cursor-pointer items-center gap-2 outline-none", className)}
    >
      <Image src="/icons/backIcon.svg" alt="" width={7} height={11} aria-hidden />
      <span className="text-[14px] text-[rgba(125,125,125,1)]">
        {t("stat.back_to_previous", "Գնալ նախորդ էջ")}
      </span>
    </button>
  );
}
