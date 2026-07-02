import { FeedbackMap } from "@/components/site/feedback/FeedbackMap";
import { MarkdownText } from "@/components/site/MarkdownText";
import { TypographyH2 } from "@/components/ui/typography";
import Image from "next/image";
import Link from "next/link";
import { getActiveLocale } from "@/lib/get-active-locale";
import { pickLocale, type Localized } from "@/lib/i18n";
import { Tr } from "@/components/site/Tr";

type ContactUsSection =
  | {
      type: "address";
      value?: string;
    }
  | {
      type: "info";
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

function parseMapCoords(coords?: string): string {
  const value = coords?.trim();
  if (!value) return "40.1811,44.5136";

  const [latRaw, lngRaw] = value.split(",").map((part) => part.trim());
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "40.1811,44.5136";

  return `${lat},${lng}`;
}

async function getContactUsData(): Promise<ContactUsResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!baseUrl) return null;

  const res = await fetch(`${baseUrl}/contact-us`, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as ContactUsResponse;
}

type FeedbackPageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function FeedbackPage({ searchParams }: FeedbackPageProps) {
  const { lang: langParam } = await searchParams;
  const [data, lang] = await Promise.all([getContactUsData(), getActiveLocale(langParam)]);
  const title = pickLocale(data?.title, lang) ?? "";
  const description = pickLocale(data?.description, lang);
  const notificationsEmailRow = pickLocale(data?.notificationsEmailRow, lang);
  const mapTitle = data?.mapSection?.title ?? "";
  const mapCoords = parseMapCoords(data?.mapSection?.value);
  const sections = data?.sections ?? [];
  const socialLinks = (data?.socialLinks ?? []).filter((s) => Boolean(s?.link));

  const SOCIAL_ICONS: Record<string, string> = {
    facebook: "/social/fb.svg",
    instagram: "/social/in.svg",
    telegram: "/social/te.svg",
    twitter: "/social/x.svg",
    x: "/social/x.svg",
    youtube: "/social/yo.svg",
  };

  return (
    <div className="flex w-full flex-col items-center overflow-x-hidden pb-55 max-md:pb-20">
      <div className="bg-blue1000 flex w-full justify-center">
        <div className="flex w-full max-w-305 flex-col px-5 py-12">
          <TypographyH2>{title || <Tr k="feedback.title" fallback="Կապ մեզ հետ" />}</TypographyH2>
        </div>
      </div>
      <div className="flex w-full justify-center">
        <div className="flex w-full max-w-305 px-5 max-md:flex max-md:flex-col">
          <div className="flex w-full flex-col pt-10.25">
            {description ? (
              <MarkdownText className="text-[rgba(55,55,55,1)]">{description}</MarkdownText>
            ) : (
              <div className="h-18 w-full max-w-202 rounded-sm bg-black/5" />
            )}
            {sections?.length > 0 && (
              <address className="mt-12.25 flex w-full flex-col gap-6 not-italic">
                {sections.map((section, idx) => {
                  if (section.type === "address") {
                    return (
                      <div key={`address-${idx}`} className="flex flex-col gap-3.5">
                        <p className="font-medium text-[rgba(37,37,37,1)]">
                          <Tr k="feedback.address" fallback="Հասցե" />
                        </p>
                        {section.value && (
                          <p className="text-[rgba(37,37,37,1)]">{section.value}</p>
                        )}
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
                        <p className="font-medium text-[rgba(37,37,37,1)]">{section.title}</p>
                      )}
                      <div className="flex flex-col items-start gap-1">
                        {section.phone && (
                          <a
                            className="flex items-center gap-2 text-[rgba(37,37,37,1)]"
                            href={`tel:${section.phone}`}
                          >
                            <Image src="/icons/phone.svg" alt="phone" width={12} height={12} />{" "}
                            {section.phone}
                          </a>
                        )}
                        {section.email && (
                          <a
                            className="text-fontSizeS text-[rgba(15,104,192,1)]"
                            href={`mailto:${section.email}`}
                          >
                            {section.email}
                          </a>
                        )}
                        {section.link &&
                          (section.link.startsWith("http") ? (
                            <a
                              className="text-fontSizeS text-[rgba(15,104,192,1)] underline"
                              href={section.link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {section.link}
                            </a>
                          ) : (
                            <Link
                              className="text-fontSizeS text-[rgba(15,104,192,1)] underline"
                              href={section.link}
                            >
                              {section.link}
                            </Link>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </address>
            )}

            {notificationsEmailRow ? (
              <>
                <div className="mt-20 h-px w-full bg-[rgba(217,217,217,1)] max-md:mt-10" />
                <p className="mt-6 text-[rgba(37,37,37,1)]">{notificationsEmailRow}</p>
              </>
            ) : null}

            {socialLinks.length > 0 ? (
              <>
                <p className="mt-12.25 text-[18px] font-semibold text-[rgba(37,37,37,1)]">
                  <Tr k="feedback.social" fallback="Սոցիալական կայքեր՝" />
                </p>
                <nav className="mt-8.75 w-full">
                  <ul className="flex gap-2">
                    {socialLinks.map((item, idx) => {
                      const iconSrc = item.type ? SOCIAL_ICONS[item.type] : undefined;
                      const label = item.name ?? item.type ?? "social";

                      return (
                        <li key={`${item.type ?? "social"}-${idx}`}>
                          <a
                            rel="noopener noreferrer"
                            href={item.link}
                            target="_blank"
                            className="flex size-10.5 items-center justify-center rounded-lg bg-[rgba(14,22,62,1)]"
                            aria-label={label}
                            title={label}
                          >
                            {iconSrc ? (
                              <Image src={iconSrc} alt={label} width={22} height={22} />
                            ) : (
                              <span className="text-[10px] font-medium text-white">
                                {label.slice(0, 2).toUpperCase()}
                              </span>
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
          <div className="relative -right-15.75 -mt-23.5 h-130.5 w-full max-w-101 shrink-0 overflow-hidden rounded-[30px] max-md:right-0 max-md:mt-10">
            <FeedbackMap coords={mapCoords} title={mapTitle || undefined} />
          </div>
        </div>
      </div>
    </div>
  );
}
