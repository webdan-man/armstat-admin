export type ContentLangCode = "hy" | "en" | "ru";

export type ContentEntry = {
  id: number;
  key: string;
  locale: ContentLangCode;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type ContentEntriesResponse = {
  hy: ContentEntry[];
  en?: ContentEntry[];
  ru?: ContentEntry[];
};

export type ContentEntryRowItem = {
  key: string;
  locale: ContentLangCode;
  value: string;
  description: string;
};
