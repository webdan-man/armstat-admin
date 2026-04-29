import { TypographyH2 } from '@/components/ui/typography';
import Image from 'next/image';
import Link from 'next/link';

export default function BlogPage() {
  return (
    <div className="w-full max-w-295 flex flex-col pt-12 pb-40">
      <TypographyH2 className="text-textBlack800">Blog</TypographyH2>

      <div className="mt-11.25 flex gap-10 w-full shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)]">
        <div className="border border-textBlack300 rounded-sm flex flex-col">
          <div className="pt-6 px-6 flex flex-col gap-2 items-start pb-4">
            <p className="leading-[24px] tracking-normal text-textBlack600">14.09.25</p>
            <p className="font-semibold text-fontSizeL leading-[24px] tracking-normal text-textBlack800">
              Նորության վերնագիր, որը կարող է լինել երկու տող
            </p>
          </div>
          <div className="w-full h-59.75 relative">
            <Image src="/news/content.jpg" alt="post" fill />
          </div>
          <div className="px-6 pb-6 pt-4 flex flex-col gap-4">
            <p className="leading-[24px] tracking-normal text-textBlack700">
              Կարևոր է յուրաքանչյուր քարտում գրեք հակիրճ և ճշգրիտ:
            </p>
            <Link
              href={'/blog/1'}
              className="text-center w-full rounded-sm border-2 bg-link border-blue600 p-2"
            >
              Կարդալ ավելին
            </Link>
          </div>
        </div>
        <div className="border border-textBlack300 rounded-sm flex flex-col">
          <div className="pt-6 px-6 flex flex-col gap-2 items-start pb-4">
            <p className="leading-[24px] tracking-normal text-textBlack600">14.09.25</p>
            <p className="font-semibold text-fontSizeL leading-[24px] tracking-normal text-textBlack800">
              Նորության վերնագիր, որը կարող է լինել երկու տող
            </p>
          </div>
          <div className="w-full h-59.75 relative">
            <Image src="/news/content.jpg" alt="post" fill />
          </div>
          <div className="px-6 pb-6 pt-4 flex flex-col gap-4">
            <p className="leading-[24px] tracking-normal text-textBlack700">
              Կարևոր է յուրաքանչյուր քարտում գրեք հակիրճ և ճշգրիտ:
            </p>
            <Link
              href={'/blog/1'}
              className="text-center w-full rounded-sm border-2 bg-link border-blue600 p-2"
            >
              Կարդալ ավելին
            </Link>
          </div>
        </div>
        <div className="border border-textBlack300 rounded-sm flex flex-col">
          <div className="pt-6 px-6 flex flex-col gap-2 items-start pb-4">
            <p className="leading-[24px] tracking-normal text-textBlack600">14.09.25</p>
            <p className="font-semibold text-fontSizeL leading-[24px] tracking-normal text-textBlack800">
              Նորության վերնագիր, որը կարող է լինել երկու տող
            </p>
          </div>
          <div className="w-full h-59.75 relative">
            <Image src="/news/content.jpg" alt="post" fill />
          </div>
          <div className="px-6 pb-6 pt-4 flex flex-col gap-4">
            <p className="leading-[24px] tracking-normal text-textBlack700">
              Կարևոր է յուրաքանչյուր քարտում գրեք հակիրճ և ճշգրիտ:
            </p>
            <Link
              href={'/blog/1'}
              className="text-center w-full rounded-sm border-2 bg-link border-blue600 p-2"
            >
              Կարդալ ավելին
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
