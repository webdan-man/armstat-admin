"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const StatItem = ({ item }: { item: string }) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsTruncated(el.scrollHeight > el.clientHeight);
    }
  }, [item]);

  const link = (
    <Link
      href="/stat/1"
      className="block h-23 w-75 rounded-xl border border-[rgba(57,127,206,1)] p-6 text-left text-[18px] leading-5.25 font-medium text-[rgba(44,44,44,1)] transition-colors hover:bg-blue-50"
    >
      <span ref={textRef} className="line-clamp-2">
        {item}
      </span>
    </Link>
  );

  if (!isTruncated) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent className="max-w-75">{item}</TooltipContent>
    </Tooltip>
  );
};

export const StatisticsCarousel = ({
  items,
  children,
}: {
  items: string[];
  children: React.ReactNode;
}) => {
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

  const showButtons = canScrollPrev || canScrollNext;

  return (
    <div className="flex w-full flex-col gap-8.75">
      <div className="flex w-full items-center justify-between gap-10 max-md:flex-col">
        {children}
        {showButtons && (
          <div className="flex items-center gap-3">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="flex size-12 items-center justify-center rounded-xl border border-[rgba(198,198,198,1)] transition-colors hover:bg-gray-50 disabled:opacity-40"
            >
              <Image src="/icons/errow-left.svg" alt="Arrow Left" width={21} height={16} />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="flex size-12 items-center justify-center rounded-xl border border-[rgba(198,198,198,1)] transition-colors hover:bg-gray-50 disabled:opacity-40"
            >
              <Image src="/icons/arrow-right.svg" alt="Arrow Right" width={21} height={16} />
            </button>
          </div>
        )}
      </div>

      <div ref={emblaRef}>
        <div className="flex gap-4">
          {items.map((item, index) => (
            <div key={index} className="min-w-0 flex-[0_0_auto]">
              <StatItem item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
