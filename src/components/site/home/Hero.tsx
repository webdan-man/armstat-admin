"use client";

import Image from "next/image";
import Link from "next/link";
import { MarkdownText } from "@/components/site/MarkdownText";
import { TypographyH2, TypographyP } from "@/components/ui/typography";
import { useTranslation } from "@/hooks/useTranslation";

export default function Hero({
  title,
  shortDescription,
  imageSrc,
}: {
  title?: string;
  shortDescription?: string;
  imageSrc?: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col items-center">
      <section className="bg-blue1000 relative flex w-full flex-col items-center overflow-hidden rounded-br-[56px]">
        <Image
          src="/icons/arrow-botton.svg"
          alt=""
          width={29}
          height={29}
          aria-hidden
          className="pointer-events-none absolute top-[85%] right-20 z-10 hidden -translate-y-1/2 md:block"
        />
        <div className="flex w-full max-w-305 flex-col items-center px-5 pt-18 pb-2.5">
          <TypographyH2 className="relative z-10 max-w-180 text-center font-medium">
            {title}
          </TypographyH2>
          {shortDescription ? (
            <TypographyP className="text-textBlack100/70 relative z-10 mt-6 max-w-180 text-center leading-5">
              <MarkdownText as="span">{shortDescription}</MarkdownText>
            </TypographyP>
          ) : null}
          <Link
            href="/stat"
            className="text-textBlack100 relative z-10 mt-[35px] rounded-[7px] bg-[rgba(42,95,158,1)] px-[40px] py-[13px] text-[16px] leading-[24px] font-bold transition-all duration-300 hover:bg-[rgba(42,95,158,0.8)]"
          >
            {t("home.view_catalog", "Դիտել Կատալոգը")}
          </Link>
          <div className="w-max-271 relative -top-40 z-0 h-51.5 w-full">
            <Image src={"/images/hero.png"} alt={"Hero"} fill className="object-contain" />
          </div>
        </div>
      </section>
      <div className="relative -top-42.5 -mb-15 h-87 w-full max-w-295 overflow-hidden rounded-3xl">
        <Image
          src={imageSrc ?? "/images/hero.jpg"}
          alt={"Hero"}
          fill={true}
          className="object-cover"
        />
      </div>
    </div>
  );
}
