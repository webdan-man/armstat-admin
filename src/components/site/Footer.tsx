import Image from "next/image";
import Link from "next/link";

const items = [
  {
    title: "Կատալոգ",
    href: "/catalogue",
  },
  {
    title: "Հրապարակումներ",
    href: "/publications",
  },
  {
    title: "Տեղեկատվական կենտրոն",
    href: "/information-center",
  },
  {
    title: "Հետադարձ կապ",
    href: "/feedback",
  },
];

export default function Footer() {
  return (
    <footer className="border-t-warning flex w-full flex-col items-center border-t-4 pt-12 pb-10">
      <div className="flex w-full max-w-295 flex-col">
        <div className="flex w-full max-w-295 items-center justify-between py-4">
          <Link href="/">
            <Image src={"/logo-dark.svg"} alt={"Logo"} width={506} height={58} />
          </Link>
          <Link href="/">
            <Image src={"/giz-logo.svg"} alt={"Logo"} width={191} height={52} />
          </Link>
        </div>
        <nav className="mt-18 flex w-full max-w-295 items-center justify-between max-md:hidden">
          <ul className="flex gap-6">
            {items.map((item, i) => (
              <li key={item.href}>
                <Link className="text-textBlack800" href={item.href}>
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <address className="mt-10 flex w-full gap-17.5 not-italic max-md:flex-col">
          <div className="flex flex-col gap-2">
            <p className="text-fontSizeS font-semibold text-[rgba(122,122,122,1)]">Թեժ գիծ՝</p>
            <a
              className="text-[26px] text-[rgba(37,37,37,1)]"
              target="_blank"
              href="tel:+374 60 510 610"
            >
              +374 60 510 610
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-fontSizeS font-semibold text-[rgba(122,122,122,1)]">Հեռախոս`</p>
            <a
              className="text-[26px] text-[rgba(37,37,37,1)]"
              target="_blank"
              href="tel:+374 11 524 213"
            >
              +374 11 524 213
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-fontSizeS font-semibold text-[rgba(122,122,122,1)]">
              Պաշտոնական էլ. փոստ`
            </p>
            <a
              className="text-[26px] text-[rgba(37,37,37,1)]"
              target="_blank"
              href="mailto:info@armstat.am"
            >
              info@armstat.am
            </a>
          </div>
        </address>
        <nav className="mt-16.75 w-full">
          <ul className="flex gap-2">
            <li>
              <a
                rel="noopener noreferrer"
                href="./"
                target="_blank"
                className="bg-link flex size-10.5 items-center justify-center rounded-lg"
              >
                <Image src="/social/fb.svg" alt="FB" width={9} height={18} />
              </a>
            </li>
            <li>
              <a
                rel="noopener noreferrer"
                href="./"
                target="_blank"
                className="bg-link flex size-10.5 items-center justify-center rounded-lg"
              >
                <Image src="/social/in.svg" alt="In" width={22} height={22} />
              </a>
            </li>
            <li>
              <a
                rel="noopener noreferrer"
                href="./"
                target="_blank"
                className="bg-link flex size-10.5 items-center justify-center rounded-lg"
              >
                <Image src="/social/te.svg" alt="Te" width={18} height={21} />
              </a>
            </li>
            <li>
              <a
                rel="noopener noreferrer"
                href="./"
                target="_blank"
                className="bg-link flex size-10.5 items-center justify-center rounded-lg"
              >
                <Image src="/social/x.svg" alt="X" width={14} height={15} />
              </a>
            </li>
            <li>
              <a
                rel="noopener noreferrer"
                href="./"
                target="_blank"
                className="bg-link flex size-10.5 items-center justify-center rounded-lg"
              >
                <Image src="/social/yo.svg" alt="YO" width={22} height={15} />
              </a>
            </li>
          </ul>
        </nav>
        <p className="text-fontSizeXS text-textBlack800 leading-fontLine-heightXS mt-9 tracking-[1px]">
          &copy; 2025 Հայաստանի Հանրապետության Վիճակագրական Կոմիտե ԱՐՄՍՏԱՏ: Բոլոր իրավունքները
          պաշտպանված են:
        </p>
      </div>
    </footer>
  );
}
