import type { Section, Topic } from "@/types/section";

const iso = "2024-06-01T12:00:00.000Z";

function topic(
  id: string,
  sectionId: string,
  title: string,
  order: number,
  parentTopicId: string | null = null
): Topic {
  return {
    _id: id,
    sectionId,
    parentTopicId,
    title,
    body: "",
    order,
    createdAt: iso,
    updatedAt: iso,
    subtopics: [],
  };
}

/** Mock sections for the Groups admin page (Figma-aligned labels). Toggle API in page when backend is ready. */
export const MOCK_SECTIONS: Section[] = [
  {
    _id: "sec-demography",
    name: "Ժողովրդագրություն",
    description: "",
    createdAt: iso,
    updatedAt: iso,
    topics: [
      topic("top-migration", "sec-demography", "Միգրացիա", 0),
      topic("top-sub-1", "sec-demography", "Ենթաթեմա", 1),
      topic("top-refugees", "sec-demography", "Փախստականներ", 2),
      topic("top-sub-2", "sec-demography", "Ենթաթեմա", 3),
      topic("top-sub-3", "sec-demography", "Ենթաթեմա", 4),
      topic("top-sub-4", "sec-demography", "Ենթաթեմա", 5),
    ],
  },
  {
    _id: "sec-social",
    name: "Սոցիալական ապահովություն և սոցիալական ծառայություններ",
    description: "",
    createdAt: iso,
    updatedAt: iso,
    topics: [topic("soc-1", "sec-social", "Ընդհանուր", 0), topic("soc-2", "sec-social", "Ենթաբաժին", 1)],
  },
  {
    _id: "sec-edu",
    name: "Կրթություն և գիտություն",
    description: "",
    createdAt: iso,
    updatedAt: iso,
    topics: [topic("edu-1", "sec-edu", "Դպրոցական կրթություն", 0)],
  },
  {
    _id: "sec-crime",
    name: "Իրավախախտումներ",
    description: "",
    createdAt: iso,
    updatedAt: iso,
    topics: [topic("cr-1", "sec-crime", "Հաշվետվություն", 0)],
  },
  {
    _id: "sec-labour",
    name: "Աշխատաժամեր",
    description: "",
    createdAt: iso,
    updatedAt: iso,
    topics: [],
  },
  {
    _id: "sec-edu-2",
    name: "Կրթություն և գիտություն",
    description: "",
    createdAt: iso,
    updatedAt: iso,
    topics: [topic("edu2-1", "sec-edu-2", "Բարձրագույն կրթություն", 0)],
  },
];
