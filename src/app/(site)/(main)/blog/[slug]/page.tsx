import Image from 'next/image';
import Link from 'next/link';

export default function PostPage() {
  return (
    <div className="flex w-full flex-col items-center">
      <div className="w-full max-w-242.5 flex flex-col pt-9">
        <a
          href="./"
          className="flex gap-2 text-textBlack600 text-fontSizeS leading-[24px] tracking-normal items-center"
        >
          <Image src="/icons/back.svg" alt="back" width={24} height={24} />
          Գլխավոր էջ
        </a>
        <h2 className="mt-6 text-textBlack800 font-semibold text-[30px] leading-10 tracking-normal">
          Հայաստանի Հանրապետության սոցիալ-տնտեսական վիճակը 2025 թվականի հունվար-դեկտեմբերին
        </h2>
        <div className="flex justify-between">
          <p className="mt-3.75 leading-[24px] tracking-normal">12.01.2026</p>
        </div>
        <div className="relative w-full h-100 mt-6 overflow-hidden rounded-2xl">
          <Image src="/posts/post.jpg" alt="post" fill />
        </div>
        <p className="mt-11 tracking-normal leading-[24px] text-textBlack800">
          Հայաստանի Հանրապետության սոցիալ-տնտեսական վիճակը 2025 թվականի հունվար–դեկտեմբերին 2025
          թվականի հունվար–դեկտեմբեր ամիսներին Հայաստանի Հանրապետության սոցիալ-տնտեսական զարգացումը
          բնութագրվել է համեմատաբար կայուն աճով և տնտեսական ակտիվության պահպանմամբ։ Տարվա ընթացքում
          արձանագրվել է տնտեսական ակտիվության դրական միտում՝ պայմանավորված արդյունաբերության,
          ծառայությունների և շինարարության ոլորտների զարգացմամբ։ Արդյունաբերության ոլորտում
          պահպանվել է արտադրության ծավալների աճը, հատկապես մշակող արդյունաբերության և էներգետիկայի
          ենթաճյուղերում։ Ծառայությունների ոլորտը շարունակել է մնալ տնտեսության հիմնական շարժիչ
          ուժերից մեկը՝ ապահովելով զգալի մասնաբաժին համախառն ներքին արդյունքի կառուցվածքում։ ՏՏ
          ոլորտում և ֆինանսական ծառայություններում նկատվել է շարունակական զարգացում։ Շինարարության
          ոլորտում արձանագրվել է ակտիվություն՝ պայմանավորված ինչպես պետական ծրագրերով, այնպես էլ
          մասնավոր ներդրումներով։ Բնակարանաշինության և ենթակառուցվածքային ծրագրերի իրականացումը
          նպաստել է զբաղվածության աճին։ Արտաքին առևտրի ոլորտում գրանցվել է ապրանքաշրջանառության
          ընդլայնում։ Արտահանման և ներմուծման ծավալները շարունակել են աճել՝ արտահանման կառուցվածքում
          մեծացնելով վերամշակված և բարձր ավելացված արժեք ունեցող արտադրանքի մասնաբաժինը։ Գնաճը
          պահպանվել է վերահսկելի մակարդակում՝ Կենտրոնական բանկի դրամավարկային քաղաքականության
          շրջանակում։ Սոցիալական ոլորտում իրականացվել են կենսաթոշակների, նպաստների և աշխատավարձերի
          բարձրացմանն ուղղված միջոցառումներ՝ նպատակ ունենալով բարելավել բնակչության կենսամակարդակը։
          Ընդհանուր առմամբ, 2025 թվականի ընթացքում Հայաստանի սոցիալ-տնտեսական վիճակը պահպանել է
          զարգացման դրական միտում՝ միաժամանակ բախվելով արտաքին տնտեսական միջավայրի
          անորոշություններին և տարածաշրջանային մարտահրավերներին։
        </p>
      </div>
      <div className="w-full max-w-295 mt-39.5 flex flex-col pb-53.5">
        <h3 className="text-[rgba(44,44,44,1)] font-semibold text-fontSizeL">
          Նմանատիպ նորություններ
        </h3>
        <div className="mt-11.25 flex gap-10 w-full shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)]">
          <div className="border border-textBlack300 rounded-sm flex flex-col">
            <div className="pt-6 px-6 flex flex-col gap-2 items-start pb-4">
              <p className="leading-[24px] tracking-normal text-textBlack600">14.09.25</p>
              <p className="font-semibold text-fontSizeL leading-[24px] tracking-normal text-textBlack800">
                Նորության վերնագիր, որը կարող է լինել երկու տող
              </p>
            </div>
            <div className="w-full h-59.75 relative">
              <Image src="/news/content.jpg" alt="post" fill />
            </div>
            <div className="px-6 pb-6 pt-4 flex flex-col gap-4">
              <p className="leading-[24px] tracking-normal text-textBlack700">
                Կարևոր է յուրաքանչյուր քարտում գրեք հակիրճ և ճշգրիտ:
              </p>
              <Link
                href={'/blog/1'}
                className="text-center w-full rounded-sm border-2 bg-link border-blue600 p-2"
              >
                Կարդալ ավելին
              </Link>
            </div>
          </div>
          <div className="border border-textBlack300 rounded-sm flex flex-col">
            <div className="pt-6 px-6 flex flex-col gap-2 items-start pb-4">
              <p className="leading-[24px] tracking-normal text-textBlack600">14.09.25</p>
              <p className="font-semibold text-fontSizeL leading-[24px] tracking-normal text-textBlack800">
                Նորության վերնագիր, որը կարող է լինել երկու տող
              </p>
            </div>
            <div className="w-full h-59.75 relative">
              <Image src="/news/content.jpg" alt="post" fill />
            </div>
            <div className="px-6 pb-6 pt-4 flex flex-col gap-4">
              <p className="leading-[24px] tracking-normal text-textBlack700">
                Կարևոր է յուրաքանչյուր քարտում գրեք հակիրճ և ճշգրիտ:
              </p>
              <Link
                href={'/blog/1'}
                className="text-center w-full rounded-sm border-2 bg-link border-blue600 p-2"
              >
                Կարդալ ավելին
              </Link>
            </div>
          </div>
          <div className="border border-textBlack300 rounded-sm flex flex-col">
            <div className="pt-6 px-6 flex flex-col gap-2 items-start pb-4">
              <p className="leading-[24px] tracking-normal text-textBlack600">14.09.25</p>
              <p className="font-semibold text-fontSizeL leading-[24px] tracking-normal text-textBlack800">
                Նորության վերնագիր, որը կարող է լինել երկու տող
              </p>
            </div>
            <div className="w-full h-59.75 relative">
              <Image src="/news/content.jpg" alt="post" fill />
            </div>
            <div className="px-6 pb-6 pt-4 flex flex-col gap-4">
              <p className="leading-[24px] tracking-normal text-textBlack700">
                Կարևոր է յուրաքանչյուր քարտում գրեք հակիրճ և ճշգրիտ:
              </p>
              <Link
                href={'/blog/1'}
                className="text-center w-full rounded-sm border-2 bg-link border-blue600 p-2"
              >
                Կարդալ ավելին
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
