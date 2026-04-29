'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import Link from 'next/link';

export const StatisticsCarousel = ({
  items,
  children,
}: {
  items: string[];
  children: React.ReactNode;
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
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

    emblaApi.on('select', updateScrollState);
    emblaApi.on('reInit', updateScrollState);

    return () => {
      emblaApi.off('select', updateScrollState);
      emblaApi.off('reInit', updateScrollState);
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
    <div className="flex flex-col w-full gap-8.75">
      <div className="flex w-full justify-between items-center gap-10 max-md:flex-col">
        {children}
        {showButtons && (
          <div className="flex gap-3 items-center">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="size-12 border flex items-center justify-center border-[rgba(198,198,198,1)] rounded-xl transition-colors disabled:opacity-40 hover:bg-gray-50"
            >
              <Image src="/icons/errow-left.svg" alt="Arrow Left" width={21} height={16} />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="size-12 border flex items-center justify-center border-[rgba(198,198,198,1)] rounded-xl transition-colors disabled:opacity-40 hover:bg-gray-50"
            >
              <Image src="/icons/arrow-right.svg" alt="Arrow Right" width={21} height={16} />
            </button>
          </div>
        )}
      </div>

      <div ref={emblaRef}>
        <div className="flex gap-4">
          {items.map((item, index) => (
            <div key={index} className="flex-[0_0_auto] min-w-0">
              <Link
                href="/stat/1"
                className="block whitespace-break-spaces w-75 text-left font-medium text-[18px] rounded-xl text-[rgba(44,44,44,1)] py-6 pl-6 pr-20 border border-[rgba(57,127,206,1)] h-23 leading-5.25 hover:bg-blue-50 transition-colors"
              >
                {item}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
