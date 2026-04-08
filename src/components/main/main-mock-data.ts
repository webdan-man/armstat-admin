/** Mock CMS shape for the main homepage editor (no API yet). */
export type MainLangCode = "hy" | "ru" | "en";

export type MainHomeBlock = {
  id: string;
  sectionLabel: string;
  accent: "#c00" | "#275199" | "#febb30";
  key: string;
  title: string;
  subtitle: string;
  categoryPlaceholder: string;
  tags: string[];
};

export type MainUsefulLink = {
  id: string;
  title: string;
};

export type MainPageMock = {
  headers: {
    key: string;
    title: string;
    description: string;
  };
  blocks: MainHomeBlock[];
  news: {
    key: string;
    placeholder: string;
    selectedTitles: string[];
  };
  ad: {
    key: string;
    title: string;
    description: string;
  };
  usefulLinks: {
    key: string;
    links: MainUsefulLink[];
  };
};

export const MOCK_MAIN_PAGE: MainPageMock = {
  headers: {
    key: "about.content.about.text",
    title: "Հայաստանի գենդերային բաշխմամբ վիճակագրության հարթակ",
    description:
      "Գենդերային բաշխմամբ վիճակագրությունը կարևոր գործիք և ուղեցույց է կանանց ու տղամարդկանց իրավահավասարությունների և հավասար հնարավորության քաղաքականություն մշակողների, ոլորտի ակտիվիստների համար:",
  },
  blocks: [
    {
      id: "b1",
      sectionLabel: "Բաժին 1",
      accent: "#c00",
      key: "about.content.about.text",
      title: "Ժողովրդագրություն",
      subtitle: "Կարճ հուշում պարունակութոյան մասին",
      categoryPlaceholder: "Ընտրել կատեգորիաները",
      tags: ["Մշտական  բնակչություն", "Կյանքի սպասվող տևողությոն", "Ծնելիություն"],
    },
    {
      id: "b2",
      sectionLabel: "Բաժին 2",
      accent: "#275199",
      key: "about.content.about.text",
      title: "Զբաղվածություն",
      subtitle: "Կարճ հուշում պարունակութոյան մասին",
      categoryPlaceholder: "Ընտրել կատեգորիաները",
      tags: ["Մշտական  բնակչություն", "Կյանքի սպասվող տևողությոն", "Ծնելիություն"],
    },
    {
      id: "b3",
      sectionLabel: "Բաժին 3",
      accent: "#febb30",
      key: "about.content.about.text",
      title: "Կրթություն և գիտություն",
      subtitle: "Կարճ հուշում պարունակութոյան մասին",
      categoryPlaceholder: "Ընտրել կատեգորիաները",
      tags: ["Մշտական  բնակչություն", "Կյանքի սպասվող տևողությոն", "Ծնելիություն"],
    },
  ],
  news: {
    key: "about.content.about.text",
    placeholder: "Ընտրել նորությունները",
    selectedTitles: [
      "Նորության վերնագիր, որը կարող է լինել երկու տող",
      "Նորության վերնագիր, որը կարող է լինել երկու տող",
      "Նորության վերնագիր, որը կարող է լինել երկու տող",
    ],
  },
  ad: {
    key: "about.content.about.text",
    title: "Որևէ հետաքրքիր նյութ",
    description:
      "Լորեմ իպսում դոլոր սիթ ամեթ, կոնսեկթեթուր ադիպիսցինգ էլիթ. Ուտ էլիթ էլիթ, ֆասիլիսի սեդ պորտտիթոր աք, ֆաուցիբուս վել լիգուլա. Սեդ ալիքուեթ լորեմ աք օդիո ուլտրիչիես, վել աուքթոր պուրուս ալիքուեթ. Մաուրիս նոն ինթերդում իպսում. Պրոին էլիթ նունկ, բլանդիթ եու ֆաուցիբուս վել, ուլտրիսիս ուտ նունկ. Պելլենտեսքուե.",
  },
  usefulLinks: {
    key: "about.content.about.text",
    links: [
      { id: "l1", title: "Վերնագրիրը այստեղ" },
      { id: "l2", title: "Վերնագրիրը այստեղ" },
      { id: "l3", title: "Վերնագրիրը այստեղ" },
    ],
  },
};
