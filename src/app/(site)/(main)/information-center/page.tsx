import Image from 'next/image';
import Link from 'next/link';
import { TypographyH2 } from '@/components/ui/typography';
import { defaultLocale, type Locale } from '@/lib/i18n';

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
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
  if (!pathOrUrl.startsWith('/')) return `${baseUrl}/${pathOrUrl}`;
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

  const res = await fetch(`${baseUrl}/information-center`, { cache: 'no-store' });
  if (!res.ok) return null;
  return (await res.json()) as InformationCenterResponse;
}

export default async function InformationCenterPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const assetBaseUrl = getOrigin(baseUrl);
  const data = await getInformationCenterData();

  const title = pickLocale(data?.title) ?? 'Տեղեկատվական կենտրոն';
  const description = pickLocale(data?.description);
  const heroImageSrc = absolutizeUrl(data?.image, assetBaseUrl) ?? '/images/legal-acts.jpg';

  return (
    <div className="flex w-full flex-col items-center overflow-x-hidden pb-55">
      <div className="bg-blue1000 w-full flex justify-center">
        <div className="flex flex-col max-w-295 w-full py-12">
          <TypographyH2>Տեղեկատվական կենտրոն</TypographyH2>
        </div>
      </div>

      <div className="bg-[rgba(245,246,233,1)] w-full flex justify-center">
        <div className="flex max-w-295 w-full ">
          <div className="w-full pt-23 pb-26.5 flex flex-col">
            <h3 className="text-[rgba(55,55,55,1)] font-semibold text-[23px]">{title}</h3>
            <p className="text-[rgba(55,55,55,1)] mt-8.5">{description}</p>
          </div>
          <div className="w-full relative max-w-134.75 h-136.75 shrink-0 -mt-16.75 rounded-r-[159px] rounded-tl-[159px] overflow-hidden -right-18">
            <Image src={heroImageSrc} alt="Տեղեկատվական կենտրոն" fill />
          </div>
        </div>
      </div>

      <div className="flex flex-col max-w-295 w-full pt-27.25">
        <div className="flex flex-col max-w-202 w-full justify-start">
          <h3 className="text-[rgba(55,55,55,1)] font-semibold text-[23px]">
            ԱՐՄՍՏԱՏ Տեղեկատվական ինֆորմացիա
          </h3>

          {(data?.sections ?? []).map((section, index) => {
            const sectionTitle = pickLocale(section.title) ?? '';
            const sectionDescription = pickLocale(section.description) ?? '';
            const link = section.link ?? '';
            const fileLink = section.file ?? '';

            return (
              <div key={index}>
                <h5 className="text-[rgba(0,0,0,1)] font-medium text-ontSizeM mt-10">
                  {sectionTitle}
                </h5>
                <p className="mt-3 text-fontSizeXS text-[rgba(85,85,85,1)]">{sectionDescription}</p>

                <div className="flex items-center gap-10 mt-6">
                  {fileLink ? (
                    <a
                      href={fileLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link flex text-[12px] items-center"
                    >
                      <Image src="/icons/download.svg" alt="download" width={20} height={20} />{' '}
                      Տեսնել
                    </a>
                  ) : null}

                  <p className="text-[12px] text-[rgba(110,127,136,1)]">
                    Հղում՝{' '}
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
