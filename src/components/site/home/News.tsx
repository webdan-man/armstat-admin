import { TypographyH2, TypographyH3, TypographyP } from '@/components/ui/typography';
import Image from 'next/image';
import Link from 'next/link';

type NewsItem = {
  _id: string;
  title: string;
  content: string;
  image?: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
};

function formatDate(input?: string) {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString('hy-AM');
}

export default function News({ items }: { items: NewsItem[] }) {
  const data = items ?? [];

  return (
    <section className="flex w-full flex-col items-center">
      <div className="w-full max-w-295 flex py-15 items-start flex-col">
        <TypographyH2 className="text-[rgba(44,44,44,1)] font-medium max-w-180 text-center">
          Նորություններ
        </TypographyH2>
        <div className="mt-15 gap-10 grid grid-cols-3 max-md:flex max-md:flex-col">
          {data.map((item) => (
            <div
              key={item._id}
              className="w-full rounded-lg border border-textBlack300 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)]"
            >
              <div className="w-full px-6 pt-6 pb-4 flex flex-col gap-2">
                <TypographyP className={'text-textBlack600'}>
                  {formatDate(item.updatedAt ?? item.createdAt)}
                </TypographyP>
                <TypographyH3 className={'text-textBlack800 tracking-normal'}>
                  {item.title}
                </TypographyH3>
              </div>
              <div className="relative w-full h-59.75">
                <Image src={item.image ?? '/news/content.jpg'} alt={'News'} fill={true} />
              </div>
              <div className="px-6 pt-6 pb-4 flex flex-col gap-4">
                <TypographyP className="text-textBlack700 tracking-normal">{item.content}</TypographyP>
                <Link
                  href={item.url && item.url.length > 0 ? item.url : `/news/${item._id}`}
                  className="text-center w-full rounded-sm border-2 bg-link border-blue600 p-2"
                >
                  Կարդալ ավելին
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
