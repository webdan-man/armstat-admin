export type AttributeValue = {
  _id: string;
  number: number;
  parentTitle: {
    [key: string]: string;
  } | null;
  title: {
    [key: string]: string;
  };
};

export type Attribute = {
  _id: string;
  category: string;
  title: {
    [key: string]: string;
  };
  values: AttributeValue[];
};


export type AttributeCategory = {
  value: string;
  title: {
    [key: string]: string;
  };
};
