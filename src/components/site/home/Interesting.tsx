"use client";

import { TypographyH2, TypographyP } from "@/components/ui/typography";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { pickLocale, type Localized } from "@/lib/i18n";

export type InterestingProps = {
  title: Localized;
  description: Localized;
  image?: string;
};

export default function Interesting({ title, description, image }: InterestingProps) {
  const { activeLang } = useTranslation();
  const heading = pickLocale(title, activeLang) ?? "";
  const body = pickLocale(description, activeLang) ?? "";

  if (!heading && !body && !image) return null;

  return (
    <section className="flex w-full flex-col items-center bg-[linear-gradient(to_right,rgba(14,22,62,1)_50%,rgba(245,246,233,1)_50%)]">
      <div className="relative flex w-full max-w-305 gap-25 bg-[rgba(245,246,233,1)] px-5 max-md:flex max-md:flex-col max-md:p-5">
        <div className="absolute z-10 h-full w-full max-md:w-[calc(100%-40px)]">
          <Image src={"/bg/interesting.svg"} alt="" fill={true} />
        </div>
        <div className="shrink-0 overflow-hidden rounded-tl-[159px] rounded-r-[159px] max-md:flex">
          <Image
            src={image || "/bg/interesting.jpg"}
            alt={heading || "Որևէ հետաքրքիր նյութ"}
            width={473}
            height={480}
            className={"max-md:rounded-[159px]"}
          />
        </div>
        <div className="relative z-20 flex w-full flex-col items-start justify-center">
          <TypographyH2 className="max-w-180 text-center text-[28px] font-medium text-[rgba(44,44,44,1)]">
            {heading}
          </TypographyH2>
          <TypographyP className="text-fontSizeM mt-6 leading-5 text-[rgba(44,44,44,1)]">
            {body}
          </TypographyP>
        </div>
      </div>
    </section>
  );
}
