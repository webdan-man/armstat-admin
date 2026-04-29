'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';

import { TypographyH2, TypographyH3, TypographyP } from '@/components/ui/typography';
import Image from 'next/image';

type UsefulLink = {
  url: string;
  image: string;
  name: string;
  description: string;
};

export type LinksProps = {
  links: UsefulLink[];
};

export default function Links({ links }: LinksProps) {
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

  return (
    <section className="flex w-full flex-col py-30 items-center overflow-hidden">
      <div className="w-full max-w-295 flex items-start flex-col">
        <TypographyH2 className="text-[rgba(44,44,44,1)] font-medium max-w-180 text-center">
          Օգտակար հղումներ
        </TypographyH2>
      </div>

      <div className="relative w-full flex justify-center mt-15">
        <div className="w-full max-w-295 flex items-start flex-col">
          <div className="flex flex-col w-full">
            <div ref={emblaRef}>
              <div className="flex gap-6.25">
                {(links ?? []).map((item, i) => (
                  <div
                    key={i}
                    className="flex-[0_0_auto] w-92 border border-textBlack300 p-6 rounded-lg"
                  >
                    <div className="relative w-full h-39.5">
                      <Image src={item.image || '/links/link1.jpg'} alt="Link" fill />
                    </div>

                    <TypographyH3 className="mt-4 text-textBlack800">
                      {item.name || 'Վերնագրիրը այստեղ'}
                    </TypographyH3>

                    <TypographyP className="mt-4 text-textBlack700">
                      {item.description || 'Լրացուցիչ տեղեկություններն այստեղ'}
                    </TypographyP>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT BUTTON */}
        {canScrollNext && (
          <div className="absolute flex items-center justify-center h-full w-83 bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,#FFFFFF_85.09%)] right-0 top-0">
            <button
              onClick={scrollNext}
              className="cursor-pointer border border-[rgba(198,198,198,1)] bg-textBlack100 rounded-[12px] flex items-center justify-center w-12 h-12"
            >
              <Image src={'/arrowRight.svg'} width="21" height="16" alt={'Arrow right'} />
            </button>
          </div>
        )}

        {/* LEFT BUTTON */}
        {canScrollPrev && (
          <div className="absolute flex items-center justify-center h-full w-83 bg-[linear-gradient(270deg,rgba(255,255,255,0)_0%,#FFFFFF_85.09%)] left-0 top-0">
            <button
              onClick={scrollPrev}
              className="cursor-pointer border border-[rgba(198,198,198,1)] bg-textBlack100 rounded-[12px] flex items-center justify-center w-12 h-12"
            >
              <Image
                src={'/arrowRight.svg'}
                className="rotate-180"
                width="21"
                height="16"
                alt={'Arrow right'}
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
