export type Attribute = {
  _id: string;
  category: string;
  key: string;
  translations: {
    [key: string]: string;
  };
  values: Array<{
    _id: string;
    number: number;
    key: string;
    parent: null;
    translations: {
      [key: string]: string;
    };
  }>;
};
