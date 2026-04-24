/** Main homepage editor types and API mappers. */
export type MainLangCode = "hy" | "ru" | "en";

export type MainHomeBlock = {
  id: string;
  sectionLabel: string;
  accent: "#c00" | "#275199" | "#febb30";
  titleKey: string;
  title: HomePageLocalizedText;
  subtitle: HomePageLocalizedText;
  sectionIds: string[];
  sections: HomePageSection[];
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
  news: {
    availableItems: HomePageNewsItem[];
    selectedIds: string[];
  };
  usefulLinks: {
    key: string;
    links: MainUsefulLink[];
  };
};

const EMPTY_BLOCKS: MainHomeBlock[] = [
  {
    id: "b1",
    sectionLabel: "Բաժին 1",
    accent: "#c00",
    titleKey: "",
    title: { hy: "" },
    subtitle: { hy: "" },
    sectionIds: [],
    sections: [],
    image: "",
  },
  {
    id: "b2",
    sectionLabel: "Բաժին 2",
    accent: "#275199",
    titleKey: "",
    title: { hy: "" },
    subtitle: { hy: "" },
    sectionIds: [],
    sections: [],
    image: "",
  },
  {
    id: "b3",
    sectionLabel: "Բաժին 3",
    accent: "#febb30",
    titleKey: "",
    title: { hy: "" },
    subtitle: { hy: "" },
    sectionIds: [],
    sections: [],
    image: "",
  },
];

export const EMPTY_MAIN_PAGE: MainPageMock = {
  heroTitle: { hy: "" },
  heroShortDescription: { hy: "" },
  heroTextContent: { hy: "" },
  heroImage: "",
  blocks: EMPTY_BLOCKS,
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

export type HomePageSection = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type HomePageFeaturedBlock = {
  titleKey: string;
  sectionIds: string[];
  sections: HomePageSection[];
  image: string;
};

export type HomePageNewsItem = {
  _id: string;
  title: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

export const MOCK_NEWS_ITEMS: HomePageNewsItem[] = [
  {
    _id: "mock-news-1",
    title: "Վիճակագրական տարեգիրք 2025",
    content: "Հրապարակվել է ամենամյա վիճակագրական տարեգիրքը։",
    url: "https://example.com/news/1",
    image: "",
    publishedAt: "2026-01-15T10:00:00.000Z",
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-01-15T10:00:00.000Z",
  },
  {
    _id: "mock-news-2",
    title: "Գնաճի ցուցանիշը մարտ ամսին",
    content: "Գնաճը կազմել է 3.1% նախորդ տարվա մարտի համեմատ։",
    url: "https://example.com/news/2",
    image: "",
    publishedAt: "2026-04-05T09:30:00.000Z",
    createdAt: "2026-04-05T09:30:00.000Z",
    updatedAt: "2026-04-05T09:30:00.000Z",
  },
  {
    _id: "mock-news-3",
    title: "Գործազրկության մակարդակը նվազել է",
    content: "Գործազրկության մակարդակը նվազել է 1.2 տոկոսային կետով։",
    url: "https://example.com/news/3",
    image: "",
    publishedAt: "2026-03-20T12:00:00.000Z",
    createdAt: "2026-03-20T12:00:00.000Z",
    updatedAt: "2026-03-20T12:00:00.000Z",
  },
  {
    _id: "mock-news-4",
    title: "Արտահանման ցուցանիշներ 2026 Q1",
    content: "Առաջին եռամսյակի արտահանման ցուցանիշները աճել են 8.4%-ով։",
    url: "https://example.com/news/4",
    image: "",
    publishedAt: "2026-04-10T08:00:00.000Z",
    createdAt: "2026-04-10T08:00:00.000Z",
    updatedAt: "2026-04-10T08:00:00.000Z",
  },
  {
    _id: "mock-news-5",
    title: "Բնակչության թվաքանակի վերջին տվյալները",
    content: "Հրապարակվել են բնակչության վերջին գրանցված ցուցանիշները։",
    url: "https://example.com/news/5",
    image: "",
    publishedAt: "2026-02-28T14:45:00.000Z",
    createdAt: "2026-02-28T14:45:00.000Z",
    updatedAt: "2026-02-28T14:45:00.000Z",
  },
];

export type HomePageUsefulLink = {
  url: string;
  image: string;
  name: HomePageLocalizedText;
  description: HomePageLocalizedText;
};

export type HomePageApiResponse = {
  _id: string;
  heroTitle: HomePageLocalizedText;
  heroShortDescription: HomePageLocalizedText;
  heroTextContent: HomePageLocalizedText;
  heroImage: string;
  featuredBlocks: HomePageFeaturedBlock[];
  newsIds: string[];
  newsItems: HomePageNewsItem[];
  usefulLinks: HomePageUsefulLink[];
  createdAt: string;
  updatedAt: string;
};

function toRequiredLocalized(localized: HomePageLocalizedText | undefined): HomePageLocalizedText {
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
      titleKey: apiBlock?.titleKey ?? "",
      sectionIds: apiBlock?.sectionIds ?? [],
      sections: apiBlock?.sections ?? [],
      image: apiBlock?.image ?? "",
    };
  });

  return {
    heroTitle: toRequiredLocalized(apiData.heroTitle),
    heroShortDescription: toRequiredLocalized(apiData.heroShortDescription),
    heroTextContent: toRequiredLocalized(apiData.heroTextContent),
    heroImage: apiData.heroImage ?? "",
    blocks: mappedBlocks,
    news: {
      availableItems:
        apiData.newsItems && apiData.newsItems.length > 0
          ? apiData.newsItems
          : MOCK_NEWS_ITEMS,
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
