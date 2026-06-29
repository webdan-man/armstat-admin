import Image from "next/image";
import Link from "next/link";
import { MarkdownText } from "@/components/site/MarkdownText";
import { TypographyH2 } from "@/components/ui/typography";
import { getActiveLocale } from "@/lib/get-active-locale";
import { pickLocale, type Localized } from "@/lib/i18n";
import { Tr } from "@/components/site/Tr";
import { cn } from "@/lib/utils";
import styles from "./information-center.module.css";

type InformationCenterSection = {
  title?: Localized;
  description?: Localized;
  link?: string;
  file?: string;
};

type InformationCenterResponse = {
  _id: string;
  title?: Localized;
  description?: Localized;
  image?: string;
  sections?: InformationCenterSection[];
  createdAt?: string;
  updatedAt?: string;
};

function absolutizeUrl(pathOrUrl: string | undefined, baseUrl: string) {
  if (!pathOrUrl) return undefined;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  if (!pathOrUrl.startsWith("/")) return `${baseUrl}/${pathOrUrl}`;
  return `${baseUrl}${pathOrUrl}`;
}

function getOrigin(url: string) {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

async function getInformationCenterData(): Promise<InformationCenterResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) return null;

  const res = await fetch(`${baseUrl}/information-center`, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as InformationCenterResponse;
}

type InformationCenterPageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function InformationCenterPage({ searchParams }: InformationCenterPageProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const assetBaseUrl = getOrigin(baseUrl);
  const { lang: langParam } = await searchParams;
  const [data, lang] = await Promise.all([getInformationCenterData(), getActiveLocale(langParam)]);

  const title = pickLocale(data?.title, lang) ?? "";
  const description = pickLocale(data?.description, lang);
  const heroImageSrc = absolutizeUrl(data?.image, assetBaseUrl) ?? "/images/legal-acts.jpg";

  return (
    <div className="flex w-full flex-col items-center overflow-x-hidden pb-55 max-md:pb-20">
      <div className="bg-blue1000 flex w-full justify-center">
        <div className="flex w-full max-w-305 flex-col px-5 py-12">
          <TypographyH2>
            <Tr k="navigation.information_center" fallback="Տեղեկատվական կենտրոն" />
          </TypographyH2>
        </div>
      </div>
      <div className="flex w-full justify-center bg-[rgba(245,246,233,1)]">
        <div className="flex w-full max-w-305 px-5 max-md:flex max-md:flex-col">
          <div className="flex w-full flex-col pt-23 pb-26.5 max-md:pb-10">
            <h3 className="text-[23px] font-semibold text-[rgba(55,55,55,1)]">
              {title || <Tr k="information_center.title" fallback="Տեղեկատվական կենտրոն" />}
            </h3>
            {description ? (
              <MarkdownText className="mt-8.5 text-[rgba(55,55,55,1)]">{description}</MarkdownText>
            ) : null}
          </div>
          <div className="relative -right-18 -mt-16.75 h-136.75 w-full max-w-134.75 shrink-0 overflow-hidden rounded-tl-[159px] rounded-r-[159px] max-md:right-0 max-md:mt-10">
            <Image src={heroImageSrc} alt={title} fill className="object-cover" />
          </div>
        </div>
      </div>
      <div className="flex w-full max-w-305 flex-col px-5 pt-27.25 max-md:pt-10">
        <div className="flex w-full max-w-202 flex-col justify-start">
          <h3 className="text-[23px] font-semibold text-[rgba(55,55,55,1)]">
            <Tr k="information_center.heading" fallback="ԱՐՄՍՏԱՏ Տեղեկատվական ինֆորմացիա" />
          </h3>

          {(data?.sections ?? []).map((section, index) => {
            const sectionTitle = pickLocale(section.title, lang) ?? "";
            const sectionDescription = pickLocale(section.description, lang) ?? "";
            const link = section.link ?? "";
            const fileLink = section.file ?? "";

            return (
              <div key={index}>
                <h5 className="text-ontSizeM mt-10 font-medium text-[rgba(0,0,0,1)]">
                  {sectionTitle}
                </h5>
                {sectionDescription ? (
                  <MarkdownText className="text-fontSizeXS mt-3 text-[rgba(85,85,85,1)]">
                    {sectionDescription}
                  </MarkdownText>
                ) : null}

                <div className="mt-6 flex items-center gap-10">
                  {fileLink ? (
                    <a
                      href={`${process.env.NEXT_PUBLIC_BASE_URL}${fileLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link flex items-center text-[12px]"
                    >
                      <Image src="/icons/download.svg" alt="download" width={20} height={20} />{" "}
                      <Tr k="information_center.view" fallback="Տեսնել" />
                    </a>
                  ) : null}

                  {link ? (
                    <Link
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(styles.externalLink, "text-link text-[12px] font-semibold")}
                    >
                      <Tr k="information_center.link_source" fallback="Հղման աղբյուրը" />
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
