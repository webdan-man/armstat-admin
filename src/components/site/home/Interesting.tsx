import { TypographyH2, TypographyH3, TypographyH4, TypographyP } from "@/components/ui/typography";
import Image from "next/image";

export default function Interesting() {
  return (
    <section className="flex w-full flex-col items-center bg-[linear-gradient(to_right,rgba(14,22,62,1)_50%,rgba(245,246,233,1)_50%)]">
      <div className="relative flex w-full max-w-305 gap-25 bg-[rgba(245,246,233,1)] px-5 max-md:flex max-md:flex-col max-md:p-5">
        <div className="absolute z-10 h-full w-full max-md:w-[calc(100%-40px)]">
          <Image src={"/bg/interesting.svg"} alt="Որևէ հետաքրքիր նյութ" fill={true} />
        </div>
        <div className="shrink-0 overflow-hidden rounded-tl-[159px] rounded-r-[159px] max-md:flex">
          <Image
            src={"/bg/interesting.jpg"}
            alt="Որևէ հետաքրքիր նյութ"
            width={473}
            height={480}
            className={"max-md:rounded-[159px]"}
          />
        </div>
        <div className="relative z-20 flex w-full flex-col items-start justify-center">
          <TypographyH2 className="max-w-180 text-center text-[28px] font-medium text-[rgba(44,44,44,1)]">
            Որևէ հետաքրքիր նյութ
          </TypographyH2>
          <TypographyP className="text-fontSizeM mt-6 leading-5 text-[rgba(44,44,44,1)]">
            Լորեմ իպսում դոլոր սիթ ամեթ, կոնսեկթեթուր ադիպիսցինգ էլիթ. Ուտ էլիթ էլիթ, ֆասիլիսի սեդ
            պորտտիթոր աք, ֆաուցիբուս վել լիգուլա. Սեդ ալիքուեթ լորեմ աք օդիո ուլտրիչիես, վել աուքթոր
            պուրուս ալիքուեթ. Մաուրիս նոն ինթերդում իպսում. Պրոին էլիթ նունկ, բլանդիթ եու ֆաուցիբուս
            վել, ուլտրիսիս ուտ նունկ. Պելլենտեսքուե.
          </TypographyP>
        </div>
      </div>
    </section>
  );
}
