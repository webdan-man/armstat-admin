"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

import { MarkdownText } from "@/components/site/MarkdownText";
import { TypographyH2, TypographyH3, TypographyP } from "@/components/ui/typography";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { pickLocale, type Localized } from "@/lib/i18n";

type UsefulLink = {
  url: string;
  image: string;
  name: Localized;
  description: Localized;
};

export type LinksProps = {
  links: UsefulLink[];
};

export default function Links({ links }: LinksProps) {
  const { t, activeLang } = useTranslation();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    if (!emblaApi) return;

    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    updateScrollState();

    emblaApi.on("select", updateScrollState);
    emblaApi.on("reInit", updateScrollState);

    return () => {
      emblaApi.off("select", updateScrollState);
      emblaApi.off("reInit", updateScrollState);
    };
  }, [emblaApi, updateScrollState]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  return (
    <section className="flex w-full flex-col items-center overflow-hidden py-30">
      <div className="flex w-full max-w-305 flex-col items-start px-5">
        <TypographyH2 className="max-w-180 text-center font-medium text-[rgba(44,44,44,1)]">
          {t("home.links.title", "Օգտակար հղումներ")}
        </TypographyH2>
      </div>

      <div className="relative mt-15 flex w-full justify-center">
        <div className="flex w-full max-w-305 flex-col items-start px-5">
          <div className="flex w-full flex-col">
            <div ref={emblaRef}>
              <div className="flex gap-6.25">
                {(links ?? []).map((item, i) => (
                  <div
                    key={i}
                    className="border-textBlack300 w-92 flex-[0_0_auto] rounded-lg border p-6"
                  >
                    <div className="relative h-39.5 w-full overflow-hidden">
                      <Image
                        src={item.image || "/links/link1.jpg"}
                        alt="Link"
                        fill
                        className="object-cover"
                      />
                    </div>

                    <TypographyH3 className="text-textBlack800 mt-4">
                      {pickLocale(item.name, activeLang)}
                    </TypographyH3>

                    <TypographyP className="text-textBlack700 mt-4 line-clamp-2">
                      <MarkdownText as="span">
                        {pickLocale(item.description, activeLang)}
                      </MarkdownText>
                    </TypographyP>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT BUTTON */}
        {canScrollNext && (
          <div className="absolute top-0 right-0 flex h-full w-83 items-center justify-center bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,#FFFFFF_85.09%)]">
            <button
              onClick={scrollNext}
              className="bg-textBlack100 flex h-12 w-12 cursor-pointer items-center justify-center rounded-[12px] border border-[rgba(198,198,198,1)]"
            >
              <Image src={"/arrowRight.svg"} width="21" height="16" alt={"Arrow right"} />
            </button>
          </div>
        )}

        {/* LEFT BUTTON */}
        {canScrollPrev && (
          <div className="absolute top-0 left-0 flex h-full w-83 items-center justify-center bg-[linear-gradient(270deg,rgba(255,255,255,0)_0%,#FFFFFF_85.09%)]">
            <button
              onClick={scrollPrev}
              className="bg-textBlack100 flex h-12 w-12 cursor-pointer items-center justify-center rounded-[12px] border border-[rgba(198,198,198,1)]"
            >
              <Image
                src={"/arrowRight.svg"}
                className="rotate-180"
                width="21"
                height="16"
                alt={"Arrow right"}
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
