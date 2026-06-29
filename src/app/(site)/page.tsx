import Hero from "@/components/site/home/Hero";
import News from "@/components/site/home/News";
import LinksClient from "@/components/site/home/LinksClient";
import Interesting from "@/components/site/home/Interesting";
import Statistics from "@/components/site/home/Statistics";
import Footer from "@/components/site/Footer";
import { getActiveLocale } from "@/lib/get-active-locale";
import { pickLatestNews } from "@/utils/news.util";
import { pickLocale, type Localized } from "@/lib/i18n";

type HomePageResponse = {
  _id: string;
  heroTitle?: Localized;
  heroShortDescription?: Localized;
  heroImage?: string;
  featuredBlocks?: Array<{
    title?: Localized;
    subtitle?: Localized;
    sectionIds: string[];
    image?: string;
    sections: unknown[];
  }>;
  advertising?: {
    title?: Localized;
    description?: Localized;
    image?: string;
  };
  newsIds?: string[];
  newsItems?: Array<{
    _id: string;
    title: string;
    content: string;
    image?: string;
    url?: string;
    publishedAt?: string;
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

async function getLatestNews(limit = 3): Promise<HomePageResponse["newsItems"]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) return [];

  try {
    const res = await fetch(`${baseUrl}/news?limit=50&page=1`, { cache: "no-store" });
    if (!res.ok) return [];

    const json = (await res.json()) as { data?: HomePageResponse["newsItems"] };
    return pickLatestNews(json.data ?? [], limit);
  } catch {
    return [];
  }
}

type HomePageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const { lang: langParam } = await searchParams;
  const [data, lang, latestNews] = await Promise.all([
    getHomePageData(),
    getActiveLocale(langParam),
    getLatestNews(3),
  ]);

  return (
    <>
      <Hero
        title={pickLocale(data?.heroTitle, lang)}
        shortDescription={pickLocale(data?.heroShortDescription, lang)}
        imageSrc={absolutizeUrl(data?.heroImage, baseUrl)}
      />
      <Statistics
        blocks={(data?.featuredBlocks ?? []).map((b) => ({
          title: b.title ?? {},
          subtitle: b.subtitle ?? {},
          image: absolutizeUrl(b.image, baseUrl),
          sections: ((b.sections as Array<{ _id?: string; name?: Localized }> | undefined) ?? [])
            .map((s, index) => ({
              id: s._id ?? b.sectionIds[index] ?? "",
              name: s.name ?? {},
            }))
            .filter((s) => s.id && Object.values(s.name).some(Boolean)),
        }))}
      />
      <News
        items={(latestNews ?? []).map((item) => ({
          ...item,
          image: absolutizeUrl(item.image, baseUrl),
        }))}
      />
      <Interesting
        title={data?.advertising?.title ?? {}}
        description={data?.advertising?.description ?? {}}
        image={absolutizeUrl(data?.advertising?.image, baseUrl)}
      />
      <LinksClient
        links={(data?.usefulLinks ?? []).map((link) => ({
          url: link.url ?? "",
          image: absolutizeUrl(link.image, baseUrl) ?? "",
          name: link.name ?? {},
          description: link.description ?? {},
        }))}
      />
      <Footer />
    </>
  );
}
