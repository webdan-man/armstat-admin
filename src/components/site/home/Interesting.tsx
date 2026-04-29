import { TypographyH2, TypographyH3, TypographyH4, TypographyP } from '@/components/ui/typography';
import Image from 'next/image';

export default function Interesting() {
  return (
    <section className="flex w-full flex-col items-center bg-[linear-gradient(to_right,rgba(14,22,62,1)_50%,rgba(245,246,233,1)_50%)]">
      <div className="w-full relative max-w-295 flex gap-25 bg-[rgba(245,246,233,1)] max-md:flex-col">
        <div className="absolute z-10 w-full h-full">
          <Image src={'/bg/interesting.svg'} alt="Որևէ հետաքրքիր նյութ" fill={true} />
        </div>
        <div className="overflow-hidden rounded-r-[159px] shrink-0 rounded-tl-[159px]">
          <Image src={'/bg/interesting.jpg'} alt="Որևէ հետաքրքիր նյութ" width={473} height={480} />
        </div>
        <div className="flex flex-col items-start justify-center w-full relative z-20">
          <TypographyH2 className="text-[28px] text-[rgba(44,44,44,1)] font-medium max-w-180 text-center">
            Որևէ հետաքրքիր նյութ
          </TypographyH2>
          <TypographyP className="mt-6 leading-5 text-fontSizeM text-[rgba(44,44,44,1)]">
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
