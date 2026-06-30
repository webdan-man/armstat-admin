/** Main homepage editor types and API mappers. */
import {
  normalizeFeaturedBlockItems,
  type FeaturedBlockItem,
} from "@/utils/featured-block-topics.util";
import type { MaybeLocalizedNewsText } from "@/utils/news.util";

export type MainLangCode = "hy" | "ru" | "en";

export type MainHomeBlock = {
  id: string;
  sectionLabel: string;
  accent: "#c00" | "#275199" | "#febb30";
  title: HomePageLocalizedText;
  subtitle: HomePageLocalizedText;
  items: FeaturedBlockItem[];
  image: string;
};

export type MainUsefulLink = {
  id: string;
  url: string;
  name: HomePageLocalizedText;
  description: HomePageLocalizedText;
  image: string;
};

export type MainPageMock = {
  heroTitle: HomePageLocalizedText;
  heroShortDescription: HomePageLocalizedText;
  heroTextContent: HomePageLocalizedText;
  heroImage: string;
  blocks: MainHomeBlock[];
  advertising: MainAdvertising;
  news: {
    availableItems: HomePageNewsItem[];
    selectedIds: string[];
  };
  usefulLinks: {
    key: string;
    links: MainUsefulLink[];
  };
};

export type MainAdvertising = {
  title: HomePageLocalizedText;
  description: HomePageLocalizedText;
  image: string;
};

const EMPTY_BLOCKS: MainHomeBlock[] = [
  {
    id: "b1",
    sectionLabel: "Բաժին 1",
    accent: "#c00",
    title: { hy: "" },
    subtitle: { hy: "" },
    items: [],
    image: "",
  },
  {
    id: "b2",
    sectionLabel: "Բաժին 2",
    accent: "#275199",
    title: { hy: "" },
    subtitle: { hy: "" },
    items: [],
    image: "",
  },
  {
    id: "b3",
    sectionLabel: "Բաժին 3",
    accent: "#febb30",
    title: { hy: "" },
    subtitle: { hy: "" },
    items: [],
    image: "",
  },
];

export const EMPTY_MAIN_PAGE: MainPageMock = {
  heroTitle: { hy: "" },
  heroShortDescription: { hy: "" },
  heroTextContent: { hy: "" },
  heroImage: "",
  blocks: EMPTY_BLOCKS,
  advertising: {
    title: { hy: "" },
    description: { hy: "" },
    image: "",
  },
  news: {
    availableItems: [],
    selectedIds: [],
  },
  usefulLinks: {
    key: "",
    links: [],
  },
};

export type HomePageLocalizedText = {
  hy: string;
  en?: string;
  ru?: string;
};

export type HomePageFeaturedBlock = {
  title: HomePageLocalizedText;
  subtitle: HomePageLocalizedText;
  items: FeaturedBlockItem[];
  image: string;
};

export type HomePageNewsItem = {
  _id: string;
  /** Localized per language; legacy records may still be a plain string. */
  title: MaybeLocalizedNewsText;
  content: MaybeLocalizedNewsText;
  url: string;
  image: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type HomePageUsefulLink = {
  url: string;
  image: string;
  name: HomePageLocalizedText;
  description: HomePageLocalizedText;
};

export type HomePageAdvertising = {
  title: Record<string, string>;
  description: Record<string, string>;
  image: string;
};

export type HomePageApiResponse = {
  _id: string;
  heroTitle: HomePageLocalizedText;
  heroShortDescription: HomePageLocalizedText;
  heroTextContent: HomePageLocalizedText;
  heroImage: string;
  featuredBlocks: HomePageFeaturedBlock[];
  advertising?: HomePageAdvertising;
  newsIds: string[];
  newsItems: HomePageNewsItem[];
  usefulLinks: HomePageUsefulLink[];
  activeLocales?: string[];
  createdAt: string;
  updatedAt: string;
};

function toRequiredLocalized(
  localized: Record<string, string | undefined> | undefined
): HomePageLocalizedText {
  return {
    hy: localized?.hy ?? "",
    ...(localized?.en ? { en: localized.en } : {}),
    ...(localized?.ru ? { ru: localized.ru } : {}),
  };
}

export function fromApiHomePage(
  apiData: HomePageApiResponse,
  _lang: MainLangCode = "hy"
): MainPageMock {
  const defaultBlocks = EMPTY_MAIN_PAGE.blocks;
  const mappedBlocks = defaultBlocks.map((fallbackBlock, index) => {
    const apiBlock = apiData.featuredBlocks?.[index];
    return {
      ...fallbackBlock,
      title: toRequiredLocalized(apiBlock?.title),
      subtitle: toRequiredLocalized(apiBlock?.subtitle),
      items: normalizeFeaturedBlockItems(apiBlock?.items),
      image: apiBlock?.image ?? "",
    };
  });

  return {
    heroTitle: toRequiredLocalized(apiData.heroTitle),
    heroShortDescription: toRequiredLocalized(apiData.heroShortDescription),
    heroTextContent: toRequiredLocalized(apiData.heroTextContent),
    heroImage: apiData.heroImage ?? "",
    blocks: mappedBlocks,
    advertising: {
      title: toRequiredLocalized(apiData.advertising?.title),
      description: toRequiredLocalized(apiData.advertising?.description),
      image: apiData.advertising?.image ?? "",
    },
    news: {
      availableItems: apiData.newsItems ?? [],
      selectedIds: apiData.newsIds ?? [],
    },
    usefulLinks: {
      ...EMPTY_MAIN_PAGE.usefulLinks,
      links:
        apiData.usefulLinks?.map((link, index) => ({
          id: `api-link-${index}`,
          url: link.url ?? "",
          name: toRequiredLocalized(link.name),
          description: toRequiredLocalized(link.description),
          image: link.image ?? "",
        })) ?? [],
    },
  };
}
