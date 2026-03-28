export type Attribute = {
    _id: string;
    key: string;
    values: Array<{
        key: string;
        parent: null;
        translations: {
            [key: string]: string;
        };
    }>;
    category: string;
};
