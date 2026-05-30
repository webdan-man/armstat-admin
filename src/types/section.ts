export type Topic = {
  _id: string;
  sectionId?: string;
  parentTopicId?: string | null;
  title: SectionLocalizedText;
  body?: SectionLocalizedText;
  order?: number;
  createdAt: string;
  updatedAt: string;
  subtopics?: Topic[];
};

export type SectionLocalizedText = {
  hy: string;
  ru: string;
  en: string;
};

export type Section = {
  _id: string;
  name: SectionLocalizedText;
  description: SectionLocalizedText;
  createdAt: string;
  updatedAt: string;
  topics: Topic[];
};
