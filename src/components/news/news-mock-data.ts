export type NewsItem = {
  id: string;
  title: string;
  /** Display as MM/DD/YYYY (e.g. 02/19/2026) */
  publishedLabel: string;
  link?: string;
  publishedAt?: string;
  titleTranslations?: {
    hy: string;
    ru: string;
    en: string;
  };
  contentTranslations?: {
    hy: string;
    ru: string;
    en: string;
  };
};

/** Mock news list for the admin table (no API yet). */
export const MOCK_NEWS_ITEMS: NewsItem[] = [
  { id: "1", title: "Demum agnitio cavus pectus copia.", publishedLabel: "02/19/2026" },
  {
    id: "2",
    title: "Optio territo sto concido comminor vaco debilito.",
    publishedLabel: "02/19/2026",
  },
  {
    id: "3",
    title: "Carpo valetudo circumvenio non delego desidero animus confido.",
    publishedLabel: "02/19/2026",
  },
  {
    id: "4",
    title: "Ubi bardus defaeco pecus vivo maxime contego brevis conscendo.",
    publishedLabel: "02/19/2026",
  },
  {
    id: "5",
    title: "Textilis appositus facilis ex civis cenaculum crebro corpus bis.",
    publishedLabel: "02/19/2026",
  },
  {
    id: "6",
    title: "Cultura adulescens valetudo tamen succurro animus voveo.",
    publishedLabel: "02/19/2026",
  },
  {
    id: "7",
    title: "Sufficiens thymbra auctor coerceo tergo vulariter adulescens.",
    publishedLabel: "02/19/2026",
  },
  {
    id: "8",
    title: "Vereor valetudo cernuus tamen vulariter suppellex voveo.",
    publishedLabel: "02/19/2026",
  },
  {
    id: "9",
    title: "Cultellus tamen valetudo suppellex vulariter adulescens coerceo.",
    publishedLabel: "02/19/2026",
  },
  {
    id: "10",
    title: "Adeptio voveo vulariter suppellex adulescens tamen cernuus.",
    publishedLabel: "02/19/2026",
  },
];
