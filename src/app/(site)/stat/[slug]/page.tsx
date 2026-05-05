'use client';

import { TypographyH3, TypographyP } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ChartTab from '@/components/site/stat/ChartTab';
import SearchInput from '@/components/site/stat/SearchInput';
import TableTab from '@/components/site/stat/TableTab';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { getMetricById, getMetricCombinations, fetchMetricsByTopicId } from '@/services/metricsService';
import { swrKeys } from '@/lib/swr/cache-keys';
import { Skeleton } from '@/components/ui/skeleton';

export default function StatPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: topicMetrics = [] } = useSWR(
    slug ? swrKeys.metricsByTopic(slug) : null,
    () => fetchMetricsByTopicId(slug),
  );

  const selectedMetricId = topicMetrics[0]?.id ?? null;

  const { data: metric } = useSWR(
    selectedMetricId ? swrKeys.metricForm(selectedMetricId) : null,
    () => getMetricById(selectedMetricId!),
  );
  const { data: combinations = [] } = useSWR(
    selectedMetricId ? swrKeys.metricCombinations(selectedMetricId) : null,
    () => getMetricCombinations(selectedMetricId!),
  );

  const isLoading = !metric && !!slug;

  const [data, setData] = useState([]);
  const [query, setQuery] = useState<string>('');

  return (
    <div className="w-full pt-7.5 pl-16.75 flex flex-col pb-10">
      {isLoading ? (
        <Skeleton className="h-8 w-96 mt-1" />
      ) : (
        <TypographyH3 className="text-[rgba(40,40,40,1)]">{metric?.title?.hy}</TypographyH3>
      )}
      <div className="flex gap-3 mt-5">
        <SearchInput query={query} setQuery={setQuery} setData={setData} />
        <Button
          onClick={() => {
            if (query) {
              setQuery('');
              setData([]);
            }
          }}
          variant="secondary"
          size="icon"
          className="size-10.5 cursor-pointer"
        >
          <Image
            src={query ? '/icons/close.svg' : '/icons/search-blue.svg'}
            alt="search"
            width={24}
            height={24}
          />
        </Button>
      </div>
      {data && !query ? (
        <div className="flex mt-6 flex-col">
          <div className="flex justify-between items-center ">
            <div className="flex gap-6">
              <div className="flex gap-3 items-center">
                <Image src={'/icons/man.svg'} alt="man" width={17} height={27} />
                <div className="flex flex-col">
                  <p className="text-fontSizeXS font-semibold text-[rgba(56,56,56,1)]">1,580,982</p>
                  <p className="text-[11px] text-[rgba(110,127,136,1)]">52%</p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <Image src={'/icons/women.svg'} alt="man" width={17} height={27} />
                <div className="flex flex-col">
                  <p className="text-fontSizeXS font-semibold text-[rgba(56,56,56,1)]">1,448,982</p>
                  <p className="text-[11px] text-[rgba(110,127,136,1)]">48%</p>
                </div>
              </div>
            </div>
            <div className="flex">
              <Button variant="ghost" className="gap-1 flex items-center">
                <Image src={'/icons/download.svg'} alt="download" width={20} height={20} />
                <p className="font-medium text-[12px] text-link">Ներբեռնել</p>
              </Button>
              <Button variant="ghost" className="gap-1 flex items-center">
                <Image src={'/icons/share.svg'} alt="share" width={20} height={20} />
                <p className="font-medium text-[12px] text-link">Կիսվել</p>
              </Button>
            </div>
          </div>
          {isLoading ? (
            <>
              <Skeleton className="h-6 w-3/4 mt-7.5" />
              <Skeleton className="h-4 w-full mt-3" />
              <Skeleton className="h-4 w-5/6 mt-2" />
            </>
          ) : (
            <>
              <h5 className="text-[rgba(0,0,0,1)] mt-7.5 text-[18px]">
                {metric?.title?.hy}
              </h5>
              <TypographyP className="text-fontSizeS leading-4.75 text-[rgba(125,125,125,1)] mt-3">
                {metric?.description?.hy}
              </TypographyP>
            </>
          )}
          <div className="bg-[rgba(241,245,248,1)] px-3 border-t border-[rgba(15,104,192,1)] pt-4.25 pb-4.75 mt-10 flex gap-4">
            <Select defaultValue="1">
              <SelectTrigger className="border-none text-[rgba(44,44,44,1)] bg-transparent shadow-none px-2 h-9">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="1">Ժամանակային շարք</SelectItem>
                <SelectItem value="2">Ժամանակային շարք 2</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="1">
              <SelectTrigger className="border-none text-[rgba(44,44,44,1)] bg-transparent shadow-none px-2 h-9">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="1">Տարիք</SelectItem>
                <SelectItem value="2">Տարիք 2</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="1">
              <SelectTrigger className="border-none text-[rgba(44,44,44,1)] bg-transparent shadow-none px-2 h-9">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="1">Մարզեր</SelectItem>
                <SelectItem value="2">Մարզեր 2</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="1">
              <SelectTrigger className="border-none text-[rgba(44,44,44,1)] bg-transparent shadow-none px-2 h-9">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="1">Սեռ</SelectItem>
                <SelectItem value="2">Սեռ 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="border border-[rgba(178,178,178,1)] rounded-2xl mt-6 overflow-hidden">
            <Tabs defaultValue="diagram" className="w-full">
              <TabsList className="border-b border-b-[rgba(178,178,178,1)] px-5 rounded-none w-full bg-none h-11.75">
                <TabsTrigger value="diagram" className="text-[rgba(40,40,40,1)]">
                  Գծապատկեր
                </TabsTrigger>
                <TabsTrigger value="data" className="text-[rgba(40,40,40,1)] font-medium">
                  Տվյալներ
                </TabsTrigger>
                <TabsTrigger value="metadata" className="text-[rgba(40,40,40,1)] font-medium">
                  Մետատվյալներ
                </TabsTrigger>
              </TabsList>
              <TabsContent value="diagram">
                <div className="p-7.5">
                  <ChartTab combinations={combinations} isLoading={isLoading} />
                </div>
              </TabsContent>
              <TabsContent value="data">
                <div className="px-7.5 py-5 w-full">
                  <TableTab />
                </div>
              </TabsContent>
              <TabsContent value="metadata">
                <div className="p-6 h-200 w-full">
                  <h4 className="text-fontSizeM text-[rgba(0,0,0,1)]">
                    Այստեղ պետք է լինի վերնագիր, կարող է լինել նաև երկու տող
                  </h4>
                  <p className="mt-4 text-fontSizeS leading-4.75 text-[rgba(125,125,125,1)]">
                    Լորեմ իպսում դոլոր սիթ ամեթ, կոնսեկթեթուր ադիպիսցինգ էլիթ. Ուտ էլիթ էլիթ,
                    ֆասիլիսի սեդ պորտտիթոր աք, ֆաուցիբուս վել լիգուլա. Սեդ ալիքուեթ լորեմ աք օդիո
                    ուլտրիչիես, վել աուքթոր պուրուս ալիքուեթ. Մաուրիս նոն ինթերդում իպսում. Պրոին
                    էլիթ նունկ, բլանդիթ եու ֆաուցիբուս վել, ուլտրիսիս ուտ նունկ. Պելլենտեսքուե.
                    Լորեմ իպսում դոլոր սիթ ամեթ, կոնսեկթեթուր ադիպիսցինգ էլիթ. Ուտ էլիթ էլիթ,
                    ֆասիլիսի սեդ պորտտիթոր աք, ֆաուցիբուս վել լիգուլա. Սեդ ալիքուեթ լորեմ աք օդիո
                    ուլտրիչիես, վել աուքթոր պուրուս ալիքուեթ. Մաուրիս նոն ինթերդում իպսում. Պրոին
                    էլիթ նունկ, բլանդիթ եու ֆաուցիբուս վել, ուլտրիսիս ուտ նունկ. Պելլենտեսքուե.
                  </p>
                  <h4 className="text-fontSizeM text-[rgba(0,0,0,1)] mt-7.5">
                    Այստեղ պետք է լինի վերնագիր, կարող է լինել նաև երկու տող, ՀՀ կացության
                    կարգավիճակ ստացած օտարերկրացիների բաշխումն ըստ կարգավիճա։
                  </h4>
                  <p className="mt-4 text-fontSizeS leading-4.75 text-[rgba(125,125,125,1)]">
                    Լորեմ իպսում դոլոր սիթ ամեթ, կոնսեկթեթուր ադիպիսցինգ էլիթ. Ուտ էլիթ էլիթ,
                    ֆասիլիսի սեդ պորտտիթոր աք, ֆաուցիբուս վել լիգուլա. Սեդ ալիքուեթ լորեմ աք օդիո
                    ուլտրիչիես, վել աուքթոր պուրուս ալիքուեթ. Մաուրիս նոն ինթերդում իպսում. Պրոին
                    էլիթ նունկ, բլանդիթ եու ֆաուցիբուս վել, ուլտրիսիս ուտ նունկ. Պելլենտեսքուե.
                    Լորեմ իպսում դոլոր սիթ ամեթ, կոնսեկթեթուր ադիպիսցինգ էլիթ. Ուտ էլիթ էլիթ,
                    ֆասիլիսի սեդ պորտտիթոր աք, ֆաուցիբուս վել լիգուլա. Սեդ ալիքուեթ լորեմ աք օդիո
                    ուլտրիչիես, վել աուքթոր պուրուս ալիքուեթ. Մաուրիս նոն ինթերդում իպսում. Պրոին
                    էլիթ նունկ, բլանդիթ եու ֆաուցիբուս վել, ուլտրիսիս ուտ նունկ. Պելլենտեսքուե.
                  </p>
                  <p className="mt-5 text-fontSizeS leading-4.75 text-[rgba(125,125,125,1)]">
                    Լորեմ իպսում դոլոր սիթ ամեթ, կոնսեկթեթուր ադիպիսցինգ էլիթ. Ուտ էլիթ էլիթ,
                    ֆասիլիսի սեդ պորտտիթոր աք, ֆաուցիբուս վել լիգուլա. Սեդ ալիքուեթ լորեմ աք օդիո
                    ուլտրիչիես, վել աուքթոր պուրուս ալիքուեթ. Մաուրիս նոն ինթերդում իպսում. Պրոին
                    էլիթ նունկ, բլանդիթ եու ֆաուցիբուս վել, ուլտրիսիս ուտ նունկ. Պելլենտեսքուե.
                    Լորեմ իպսում դոլոր սիթ ամեթ, կոնսեկթեթուր ադիպիսցինգ էլիթ. Ուտ էլիթ էլիթ,
                    ֆասիլիսի սեդ պորտտիթոր աք, ֆաուցիբուս վել լիգուլա. Սեդ ալիքուեթ լորեմ աք օդիո
                    ուլտրիչիես, վել աուքթոր պուրուս ալիքուեթ. Մաուրիս նոն ինթերդում իպսում. Պրոին
                    էլիթ նունկ, բլանդիթ եու ֆաուցիբուս վել, ուլտրիսիս ուտ նունկ. Պելլենտեսքուե.
                  </p>
                  <div className="flex justify-between gap-5 mt-5">
                    <div className="flex gap-5">
                      <p className="text-[rgba(110,127,136,1)] text-[11px]">
                        Թարմացված է՝ 20/05/2024, 16:43
                      </p>
                      <p className="text-[rgba(110,127,136,1)] text-[11px]">
                        Աղբյուրը՝{' '}
                        <span className="text-[rgba(39,81,153,1)]">Հղման անվանումը կարճ</span>
                      </p>
                    </div>
                    <p className="text-[rgba(110,127,136,1)] text-[11px]">Դիտված է 1,343 անգամ</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <div className="w-full h-[calc(100vh-304px)] flex flex-col justify-center items-center">
          <div className="flex flex-col items-center justify-center gap-1">
            <Image src="/empty.png" alt="empty" width={210} height={112} />
            <p className="text-textBlack600 text-fontSizeS font-medium leading-7.25">
              Որոնման արդյունքները կտեսնեք այստեղ
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
