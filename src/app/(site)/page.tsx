import Hero from '@/components/site/home/Hero';
import News from '@/components/site/home/News';
import LinksClient from '@/components/site/home/LinksClient';
import Interesting from '@/components/site/home/Interesting';
import Statistics from '@/components/site/home/Statistics';
import Footer from '@/components/site/Footer';

type Localized = Record<string, string | undefined>;

type HomePageResponse = {
  _id: string;
  heroTitle?: Localized;
  heroShortDescription?: Localized;
  heroTextContent?: Localized;
  heroImage?: string;
  featuredBlocks?: Array<{
    titleKey: string;
    sectionIds: string[];
    image?: string;
    sections: unknown[];
  }>;
  newsIds?: string[];
  newsItems?: Array<{
    _id: string;
    title: string;
    content: string;
    image?: string;
    url?: string;
    createdAt?: string;
    updatedAt?: string;
  }>;
  usefulLinks?: Array<{
    url?: string;
    image?: string;
    name?: Localized;
    description?: Localized;
  }>;
  createdAt?: string;
  updatedAt?: string;
};

function pickLocale(value?: Localized, locale: string = 'hy') {
  if (!value) return undefined;
  return value[locale] ?? value.hy ?? value.ru ?? Object.values(value).find(Boolean);
}

function absolutizeUrl(pathOrUrl: string | undefined, baseUrl: string) {
  if (!pathOrUrl) return undefined;
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
  if (!pathOrUrl.startsWith('/')) return `${baseUrl}/${pathOrUrl}`;
  return `${baseUrl}${pathOrUrl}`;
}

async function getHomePageData(): Promise<HomePageResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) return null;

  const res = await fetch(`${baseUrl}/home-page`, { cache: 'no-store' });
  if (!res.ok) return null;

  return (await res.json()) as HomePageResponse;
}

export default async function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const data = await getHomePageData();

  return (
    <>
      <Hero
        title={pickLocale(data?.heroTitle)}
        shortDescription={pickLocale(data?.heroShortDescription)}
        textContent={pickLocale(data?.heroTextContent)}
        imageSrc={absolutizeUrl(data?.heroImage, baseUrl)}
      />
      <Statistics
        blocks={(data?.featuredBlocks ?? []).map((b) => ({
          titleKey: b.titleKey,
          image: absolutizeUrl(b.image, baseUrl),
          sections:
            ((b.sections as Array<{ name?: string; title?: string }> | undefined) ?? [])
              .map((s) => ({
                name: s.name ?? s.title ?? '',
              }))
              .filter((s) => Boolean(s.name)) ?? [],
        }))}
      />
      <News
        items={
          (data?.newsItems ?? []).map((item) => ({
            ...item,
            image: absolutizeUrl(item.image, baseUrl),
          })) ?? []
        }
      />
      <Interesting />
      <LinksClient
        links={(data?.usefulLinks ?? []).map((link) => ({
          url: link.url ?? '',
          image: absolutizeUrl(link.image, baseUrl) ?? '',
          name: pickLocale(link.name) ?? '',
          description: pickLocale(link.description) ?? '',
        }))}
      />
      <Footer />
    </>
  );
}
