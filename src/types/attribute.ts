export type Attribute = {
  _id: string;
  category: string;
  key: string;
  translations: {
    [key: string]: string;
  };
  values: Array<{
    id: number;
    key: string;
    parent: null;
    translations: {
      [key: string]: string;
    };
  }>;
};
