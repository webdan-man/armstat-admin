/** Mock CMS for the Information Centre editor (no API yet). */
export type InfoCentreBlockItem = {
  id: string;
  /** Display index e.g. "01", "02" */
  indexLabel: string;
  title: string;
  description: string;
  fileName: string;
  link: string;
};

export type InformationCentreMock = {
  primary: {
    key: string;
    /** First title line */
    heroTitle: string;
    /** Second title line */
    subtitle: string;
    body: string;
  };
  secondary: {
    key: string;
    title: string;
  };
  blocks: InfoCentreBlockItem[];
};

const LONG_BODY =
  "Հայաստանի Հանրապետությունում պաշտոնական վիճակագրությունը, օրենքով լիազորված մարմինների կողմից պաշտոնական վիճակագրության հիմնարար սկզբունքների պահանջներին համապատասխան, հանրային կյանքի էական և չափակցելի երևույթների թվային արտահայտությամբ մշակված, արտադրված և տարածված, բացառապես վիճակագրական ծրագրերում արտացոլված վիճակագրությունն է, որը ներկայացուցչական հիմքով նկարագրում է Հայաստանի Հանրապետության տնտեսական, ժողովրդագրական, սոցիալական և բնապահպանական երևույթները:";

export const MOCK_INFORMATION_CENTRE: InformationCentreMock = {
  primary: {
    key: "about.content.about.text",
    heroTitle: "Տեղեկատվական կենտրոն",
    subtitle: "ԱՐՄՍՏԱՏ  Վիճակագրական Կոմիտեի մասին",
    body: LONG_BODY,
  },
  secondary: {
    key: "about.content.about.text",
    title: "ԱՐՄՍՏԱՏ  Տեղեկատվական ինֆորմացիա",
  },
  blocks: [
    {
      id: "b1",
      indexLabel: "01",
      title:
        "Վիճակագրական ծրագրերին համապատասխան իրականացնում է պաշտոնական վիճակագրության մշակումը, արտադրությունը և տարածումը.",
      description:
        "Հայաստանի Հանրապետությունում պաշտոնական վիճակագրությունը, օրենքով լիազորված մարմինների կողմից պաշտոնական վիճակագրության հիմնարար սկզբունքների պահանջներին համապատասխան, հանրային կյանքի էական և չափակցելի երևույթների թվային արտահայտությամբ մշակված, արտադրված և տարածված, բացառապես վիճակագրական ծրագրերում արտացոլված վիճակագրությունն է, որը ներկայացուցչական հիմքով նկարագրում է Հայաստանի Հանրապետության տնտեսական, ժողովրդագրական, սոցիալական և բնապահպանական երևույթները:",
      fileName: "costfx2024_001.docx",
      link: "",
    },
    {
      id: "b2",
      indexLabel: "02",
      title: "",
      description: "",
      fileName: "",
      link: "",
    },
  ],
};
