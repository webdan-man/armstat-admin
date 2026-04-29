import { TypographyH2 } from '@/components/ui/typography';
import Image from 'next/image';
import Link from 'next/link';
import { defaultLocale, type Locale } from '@/lib/i18n';

type Localized = Record<string, string | undefined>;

type ContactUsSection =
  | {
      type: 'address';
      value?: string;
    }
  | {
      type: 'info';
      title?: string;
      phone?: string;
      email?: string;
      link?: string;
    };

type ContactUsResponse = {
  _id: string;
  title?: Localized;
  description?: Localized;
  notificationsEmailRow?: Localized;
  sections?: ContactUsSection[];
  mapSection?: {
    title?: string;
    value?: string; // "lat, lng"
  };
  socialLinks?: Array<{
    type?: string;
    name?: string;
    link?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
};

function pickLocale(value?: Localized, locale: Locale = defaultLocale) {
  if (!value) return undefined;
  return value[locale] ?? value.hy ?? value.ru ?? Object.values(value).find(Boolean);
}

function buildMapEmbedSrc(coords?: string) {
  const value = coords?.trim();
  if (!value) return undefined;
  // Expected: "40.1772, 44.5035"
  const [latRaw, lngRaw] = value.split(',').map((s) => s.trim());
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=13&output=embed`;
}

async function getContactUsData(): Promise<ContactUsResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) return null;

  const res = await fetch(`${baseUrl}/contact-us`, { cache: 'no-store' });
  if (!res.ok) return null;
  return (await res.json()) as ContactUsResponse;
}

export default async function FeedbackPage() {
  const data = await getContactUsData();
  const title = pickLocale(data?.title) ?? 'Կապ մեզ հետ';
  const description = pickLocale(data?.description);
  const notificationsEmailRow = pickLocale(data?.notificationsEmailRow);
  const mapTitle = data?.mapSection?.title ?? '';
  const mapSrc = buildMapEmbedSrc(data?.mapSection?.value) ?? 'https://maps.google.com/maps?q=40.1811,44.5136&z=13&output=embed';
  const sections = data?.sections ?? [];
  const socialLinks = (data?.socialLinks ?? []).filter((s) => Boolean(s?.link));

  const SOCIAL_ICONS: Record<string, string> = {
    facebook: '/social/fb.svg',
    instagram: '/social/in.svg',
    telegram: '/social/te.svg',
    twitter: '/social/x.svg',
    x: '/social/x.svg',
    youtube: '/social/yo.svg',
  };

  return (
    <div className="flex w-full flex-col items-center overflow-x-hidden pb-55">
      <div className="bg-blue1000 w-full flex justify-center">
        <div className="flex flex-col max-w-295 w-full py-12">
          <TypographyH2>{title}</TypographyH2>
        </div>
      </div>
      <div className="w-full flex justify-center">
        <div className="flex max-w-295 w-full ">
          <div className="w-full pt-10.25 flex flex-col">
            {description ? (
              <p className="text-[rgba(55,55,55,1)]">{description}</p>
            ) : (
              <div className="h-18 w-full max-w-202 bg-black/5 rounded-sm" />
            )}
            <address className="w-full not-italic mt-12.25 flex flex-col gap-6">
              {sections.map((section, idx) => {
                if (section.type === 'address') {
                  return (
                    <div key={`address-${idx}`} className="flex flex-col gap-3.5">
                      <p className="text-[rgba(37,37,37,1)] font-medium">{'Հասցե'}</p>
                      {section.value && <p className="text-[rgba(37,37,37,1)]">{section.value}</p>}
                    </div>
                  );
                }

                const showBlock =
                  Boolean(section.title) ||
                  Boolean(section.phone) ||
                  Boolean(section.email) ||
                  Boolean(section.link);

                if (!showBlock) return null;

                return (
                  <div key={`info-${idx}`} className="flex flex-col gap-3.5">
                    {section.title && (
                      <p className="text-[rgba(37,37,37,1)] font-medium">{section.title}</p>
                    )}
                    <div className="flex flex-col gap-1">
                      {section.phone && (
                        <a
                          className="text-[rgba(37,37,37,1)] flex gap-2 items-center"
                          href={`tel:${section.phone}`}
                        >
                          <Image src="/icons/phone.svg" alt="phone" width={12} height={12} /> {section.phone}
                        </a>
                      )}
                      {section.email && (
                        <a className="text-fontSizeS text-[rgba(15,104,192,1)]" href={`mailto:${section.email}`}>
                          {section.email}
                        </a>
                      )}
                      {section.link &&
                        (section.link.startsWith('http') ? (
                          <a
                            className="text-fontSizeS text-[rgba(15,104,192,1)] underline"
                            href={section.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {section.link}
                          </a>
                        ) : (
                          <Link className="text-fontSizeS text-[rgba(15,104,192,1)] underline" href={section.link}>
                            {section.link}
                          </Link>
                        ))}
                    </div>
                  </div>
                );
              })}
            </address>

            {notificationsEmailRow ? (
              <>
                <div className="w-full h-px bg-[rgba(217,217,217,1)] mt-20" />
                <p className="mt-6 text-[rgba(37,37,37,1)]">{notificationsEmailRow}</p>
              </>
            ) : null}

            {socialLinks.length > 0 ? (
              <>
                <p className="text-[18px] text-[rgba(37,37,37,1)] font-semibold mt-12.25">Սոցիալական կայքեր՝</p>
                <nav className="w-full mt-8.75">
                  <ul className="flex gap-2">
                    {socialLinks.map((item, idx) => {
                      const iconSrc = item.type ? SOCIAL_ICONS[item.type] : undefined;
                      const label = item.name ?? item.type ?? 'social';

                      return (
                        <li key={`${item.type ?? 'social'}-${idx}`}>
                          <a
                            rel="noopener noreferrer"
                            href={item.link}
                            target="_blank"
                            className="size-10.5 bg-[rgba(14,22,62,1)] rounded-lg flex items-center justify-center"
                            aria-label={label}
                            title={label}
                          >
                            {iconSrc ? (
                              <Image src={iconSrc} alt={label} width={22} height={22} />
                            ) : (
                              <span className="text-white text-[10px] font-medium">{label.slice(0, 2).toUpperCase()}</span>
                            )}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </>
            ) : null}
          </div>
          <div className="w-full relative max-w-101 h-130.5 shrink-0 -mt-23.5 rounded-[30px]  overflow-hidden -right-15.75">
            {mapTitle ? (
              <p className="absolute z-10 left-4 top-4 bg-white/90 px-3 py-2 rounded-md text-[rgba(37,37,37,1)] font-medium">
                {mapTitle}
              </p>
            ) : null}
            <iframe
              src={mapSrc}
              className="w-full h-full border-0"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
