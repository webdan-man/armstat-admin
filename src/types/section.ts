export type Topic = {
  _id: string;
  sectionId: string;
  parentTopicId: string | null;
  title: string;
  body: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  subtopics: string[];
};

export type Section = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  topics: Topic[];
};
