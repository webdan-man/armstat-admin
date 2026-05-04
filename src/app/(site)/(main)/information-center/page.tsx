import Image from "next/image";
import Link from "next/link";
import { TypographyH2 } from "@/components/ui/typography";
import { defaultLocale, type Locale } from "@/lib/i18n";

type Localized = Record<string, string | undefined>;

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

function pickLocale(value?: Localized, locale: Locale = defaultLocale) {
  if (!value) return undefined;
  return value[locale] ?? value.hy ?? value.ru ?? Object.values(value).find(Boolean);
}

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

export default async function InformationCenterPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const assetBaseUrl = getOrigin(baseUrl);
  const data = await getInformationCenterData();

  const title = pickLocale(data?.title) ?? "Տեղեկատվական կենտրոն";
  const description = pickLocale(data?.description);
  const heroImageSrc = absolutizeUrl(data?.image, assetBaseUrl) ?? "/images/legal-acts.jpg";

  return (
    <div className="flex w-full flex-col items-center overflow-x-hidden pb-55">
      <div className="bg-blue1000 flex w-full justify-center">
        <div className="flex w-full max-w-295 flex-col py-12">
          <TypographyH2>Տեղեկատվական կենտրոն</TypographyH2>
        </div>
      </div>

      <div className="flex w-full justify-center bg-[rgba(245,246,233,1)]">
        <div className="flex w-full max-w-295">
          <div className="flex w-full flex-col pt-23 pb-26.5">
            <h3 className="text-[23px] font-semibold text-[rgba(55,55,55,1)]">{title}</h3>
            <p className="mt-8.5 text-[rgba(55,55,55,1)]">{description}</p>
          </div>
          <div className="relative -right-18 -mt-16.75 h-136.75 w-full max-w-134.75 shrink-0 overflow-hidden rounded-tl-[159px] rounded-r-[159px]">
            <Image src={heroImageSrc} alt="Տեղեկատվական կենտրոն" fill />
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-295 flex-col pt-27.25">
        <div className="flex w-full max-w-202 flex-col justify-start">
          <h3 className="text-[23px] font-semibold text-[rgba(55,55,55,1)]">
            ԱՐՄՍՏԱՏ Տեղեկատվական ինֆորմացիա
          </h3>

          {(data?.sections ?? []).map((section, index) => {
            const sectionTitle = pickLocale(section.title) ?? "";
            const sectionDescription = pickLocale(section.description) ?? "";
            const link = section.link ?? "";
            const fileLink = section.file ?? "";

            return (
              <div key={index}>
                <h5 className="text-ontSizeM mt-10 font-medium text-[rgba(0,0,0,1)]">
                  {sectionTitle}
                </h5>
                <p className="text-fontSizeXS mt-3 text-[rgba(85,85,85,1)]">{sectionDescription}</p>

                <div className="mt-6 flex items-center gap-10">
                  {fileLink ? (
                    <a
                      href={`${process.env.NEXT_PUBLIC_BASE_URL}${fileLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link flex items-center text-[12px]"
                    >
                      <Image src="/icons/download.svg" alt="download" width={20} height={20} />{" "}
                      Տեսնել
                    </a>
                  ) : null}

                  <p className="text-[12px] text-[rgba(110,127,136,1)]">
                    Հղում՝{" "}
                    <Link href={link} className="text-link font-semibold">
                      Հղման աղբյուրը
                    </Link>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
