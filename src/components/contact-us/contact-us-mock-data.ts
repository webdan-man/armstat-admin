export type ContactUsBlockType = "address" | "data" | "phone";

export type ContactUsBlock = {
  id: string;
  type: ContactUsBlockType;
  /** Address block: short label + full address */
  addressShort?: string;
  addressFull?: string;
  /** Data / phone blocks */
  departmentTitle?: string;
  phone?: string;
  link?: string;
  email?: string;
};

export type ContactUsMock = {
  key: string;
  title: string;
  body: string;
  blocks: ContactUsBlock[];
  map: {
    searchQuery: string;
    /** Figma map preview asset (replace with static file when stable). */
    previewSrc: string;
  };
};

export const MOCK_CONTACT_US: ContactUsMock = {
  key: "about.content.about.text",
  title: "Հետադարձ կապ",
  body: `Որոշակի ինֆորմացիա տեքստ ենքով լիազորված մարմինների կողմից պաշտոնական վիճակագրության հիմնարար սկզբունքների պահանջներին համապատասխան, հանրային կյանքի էական և չափակցելի երևույթների
թվային արտահայտությամբ մշակված, արտադրված և տարածված, բացառապես վիճակագրական ծրագրերում արտացոլված
վիճակագրությունն է, որը ներկայացուցչական հիմքով նկարագրում է Հայաստանի Հանրապետության տնտեսական, ժողովրդագրական,
սոցիալական և բնապահպանական երևույթները:`,
  blocks: [
    {
      id: "c1",
      type: "address",
      addressShort: "Հասցե",
      addressFull:
        "ՀՀ ք. Երևան, 0010, Հանրապետության պող., Կառավարական 3 շենք, ",
    },
    {
      id: "c2",
      type: "data",
      departmentTitle: "Մարդահամարի և ժողովրդագրության բաժին՝",
      phone: "+374 60 510 610",
      link: "",
      email: "social@armstat.am",
    },
    {
      id: "c3",
      type: "phone",
      departmentTitle: "Մարդահամարի և ժողովրդագրության բաժին՝",
      phone: "+374 60 510 610",
      link: "",
      email: "social@armstat.am",
    },
  ],
  map: {
    searchQuery: "Հանրապետության պող., Կառավարական 3 շենք, ",
    previewSrc:
      "https://www.figma.com/api/mcp/asset/e29717ad-71c4-486a-aeb7-82eefa762268",
  },
};

export const CONTACT_TYPE_LABEL: Record<
  ContactUsBlockType,
  string
> = {
  address: "Տեսակ: Հասցե",
  data: "Տեսակ: Տվյալներ",
  phone: "Տեսակ: Հեռախոս",
};
