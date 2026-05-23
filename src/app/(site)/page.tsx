import Hero from "@/components/site/home/Hero";
import News from "@/components/site/home/News";
import LinksClient from "@/components/site/home/LinksClient";
import Interesting from "@/components/site/home/Interesting";
import Statistics from "@/components/site/home/Statistics";
import Footer from "@/components/site/Footer";
import { getActiveLocale } from "@/lib/get-active-locale";
import { defaultLocale, type Locale } from "@/lib/i18n";

type Localized = Record<string, string | undefined>;

type HomePageResponse = {
  _id: string;
  heroTitle?: Localized;
  heroShortDescription?: Localized;
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

function pickLocale(value?: Localized, locale: Locale = defaultLocale) {
  if (!value) return undefined;
  return value[locale] ?? "";
}

function absolutizeUrl(pathOrUrl: string | undefined, baseUrl: string) {
  if (!pathOrUrl) return undefined;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  if (!pathOrUrl.startsWith("/")) return `${baseUrl}/${pathOrUrl}`;
  return `${baseUrl}${pathOrUrl}`;
}

async function getHomePageData(): Promise<HomePageResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) return null;

  const res = await fetch(`${baseUrl}/home-page`, { cache: "no-store" });
  if (!res.ok) return null;

  return (await res.json()) as HomePageResponse;
}

type HomePageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const { lang: langParam } = await searchParams;
  const [data, lang] = await Promise.all([getHomePageData(), getActiveLocale(langParam)]);

  return (
    <>
      <Hero
        title={pickLocale(data?.heroTitle, lang)}
        shortDescription={pickLocale(data?.heroShortDescription, lang)}
        imageSrc={absolutizeUrl(data?.heroImage, baseUrl)}
      />
      <Statistics
        blocks={(data?.featuredBlocks ?? []).map((b) => ({
          titleKey: b.titleKey,
          image: absolutizeUrl(b.image, baseUrl),
          sections:
            ((b.sections as Array<{ name?: string; title?: string }> | undefined) ?? [])
              .map((s) => ({
                name: s.name ?? s.title ?? "",
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
          url: link.url ?? "",
          image: absolutizeUrl(link.image, baseUrl) ?? "",
          name: pickLocale(link.name, lang) ?? "",
          description: pickLocale(link.description, lang) ?? "",
        }))}
      />
      <Footer />
    </>
  );
}
