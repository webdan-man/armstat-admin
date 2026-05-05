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
    heroImage: apiData.heroImage ?? "",
    blocks: mappedBlocks,
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
