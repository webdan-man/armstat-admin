export type AttributeValue = {
  _id: string;
  number: number;
  title: {
    [key: string]: string;
  };
  secondaryTitle: {
    [key: string]: string;
  } | null;
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
