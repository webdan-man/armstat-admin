import { TypographyH2, TypographyP } from "@/components/ui/typography";
import Image from "next/image";

export default function Hero({
  title,
  shortDescription,
  textContent,
  imageSrc,
}: {
  title?: string;
  shortDescription?: string;
  textContent?: string;
  imageSrc?: string;
}) {
  return (
    <div className="flex w-full flex-col items-center">
      <section className="bg-blue1000 flex w-full flex-col items-center rounded-br-[56px]">
        <div className="flex w-full max-w-295 flex-col items-center pt-18 pb-2.5">
          <TypographyH2 className="relative z-10 max-w-180 text-center font-medium">
            {title ?? "Հայաստանի գենդերային բաշխմամբ վիճակագրության հարթակ"}
          </TypographyH2>
          <TypographyP className="text-textBlack100/70 relative z-10 mt-6 max-w-180 text-center leading-5">
            {shortDescription ??
              "Գենդերային բաշխմամբ վիճակագրությունը կարևոր գործիք և ուղեցույց է կանանց ու տղամարդկանց իրավահավասարությունների և հավասար հնարավորության քաղաքականություն մշակողների, ոլորտի ակտիվիստների համար:"}
          </TypographyP>
          {textContent && (
            <TypographyP className="text-textBlack100/70 relative z-10 mt-4 max-w-180 text-center leading-5">
              {textContent}
            </TypographyP>
          )}
          <div className="w-max-271 relative -top-25 z-0 h-51.5 w-full">
            <Image src={"/images/hero.png"} alt={"Hero"} fill={true} />
          </div>
        </div>
      </section>
      <div className="relative -top-32.5 h-87 w-full max-w-295 overflow-hidden rounded-3xl">
        <Image src={imageSrc ?? "/images/hero.jpg"} alt={"Hero"} fill />
      </div>
    </div>
  );
}
