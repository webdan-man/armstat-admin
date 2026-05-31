"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { useSiteNavItems } from "@/hooks/useSiteNavItems";

export default function Footer() {
  const { t } = useTranslation();
  const navItems = useSiteNavItems();

  return (
    <footer className="border-t-warning flex w-full flex-col items-center border-t-4 pt-12 pb-10">
      <div className="flex w-full max-w-305 flex-col px-5">
        <div className="flex w-full items-center justify-between py-4 max-md:flex-col max-md:items-start max-md:gap-4">
          <Link href="/">
            <Image src={"/logo-dark.svg"} alt={"Logo"} width={506} height={58} />
          </Link>
          <Link href="/">
            <Image src={"/giz-logo.svg"} alt={"Logo"} width={191} height={52} />
          </Link>
        </div>
        <nav className="mt-18 flex w-full items-center justify-between max-md:hidden">
          <ul className="flex gap-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link className="text-textBlack800" href={item.href}>
                  {t(item.key, item.fallback)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <address className="mt-10 flex w-full gap-17.5 not-italic max-md:flex-col max-md:gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-fontSizeS font-semibold text-[rgba(122,122,122,1)]">
              {t("footer.hotline.label", "Hotline:")}
            </p>
            <a
              className="text-[26px] text-[rgba(37,37,37,1)]"
              target="_blank"
              href={`tel:${t("footer.hotline.phone", "+374 60 510 610")}`}
            >
              {t("footer.hotline.phone", "+374 60 510 610")}
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-fontSizeS font-semibold text-[rgba(122,122,122,1)]">
              {t("footer.phone.label", "Phone:")}
            </p>
            <a
              className="text-[26px] text-[rgba(37,37,37,1)]"
              target="_blank"
              href={`tel:${t("footer.phone.number", "+374 11 524 213")}`}
            >
              {t("footer.phone.number", "+374 11 524 213")}
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-fontSizeS font-semibold text-[rgba(122,122,122,1)]">
              {t("footer.email.label", "Official e-mail:")}
            </p>
            <a
              className="text-[26px] text-[rgba(37,37,37,1)]"
              target="_blank"
              href={`mailto:${t("footer.email.address", "info@armstat.am")}`}
            >
              {t("footer.email.address", "info@armstat.am")}
            </a>
          </div>
        </address>
        <nav className="mt-16.75 w-full">
          <ul className="flex gap-2">
            <li>
              <a
                rel="noopener noreferrer"
                href={t("footer.social.facebook")}
                target="_blank"
                className="bg-link flex size-10.5 items-center justify-center rounded-lg"
              >
                <Image src="/social/fb.svg" alt="FB" width={9} height={18} />
              </a>
            </li>
            <li>
              <a
                rel="noopener noreferrer"
                href={t("footer.social.linkedin")}
                target="_blank"
                className="bg-link flex size-10.5 items-center justify-center rounded-lg"
              >
                <Image src="/social/in.svg" alt="In" width={22} height={22} />
              </a>
            </li>
            <li>
              <a
                rel="noopener noreferrer"
                href={t("footer.social.telegram")}
                target="_blank"
                className="bg-link flex size-10.5 items-center justify-center rounded-lg"
              >
                <Image src="/social/te.svg" alt="Te" width={18} height={21} />
              </a>
            </li>
            <li>
              <a
                rel="noopener noreferrer"
                href={t("footer.social.x")}
                target="_blank"
                className="bg-link flex size-10.5 items-center justify-center rounded-lg"
              >
                <Image src="/social/x.svg" alt="X" width={14} height={15} />
              </a>
            </li>
            <li>
              <a
                rel="noopener noreferrer"
                href={t("footer.social.youtube")}
                target="_blank"
                className="bg-link flex size-10.5 items-center justify-center rounded-lg"
              >
                <Image src="/social/yo.svg" alt="YO" width={22} height={15} />
              </a>
            </li>
          </ul>
        </nav>
        <p className="text-fontSizeXS text-textBlack800 leading-fontLine-heightXS mt-9 tracking-[1px]">
          {t(
            "footer.copyright",
            "© 2025 Statistical Committee of the Republic of Armenia ARMSTAT. All rights reserved."
          )}
        </p>
      </div>
    </footer>
  );
}
