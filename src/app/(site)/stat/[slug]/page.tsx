'use client';

import { TypographyH3, TypographyP } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ChartTab from '@/components/site/stat/ChartTab';
import SearchInput from '@/components/site/stat/SearchInput';
import TableTab from '@/components/site/stat/TableTab';
import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { useLang } from '@/providers/LangProvider';
import { getMetricById, getMetricCombinations, fetchMetricsByTopicId } from '@/services/metricsService';
import { swrKeys } from '@/lib/swr/cache-keys';
import { Skeleton } from '@/components/ui/skeleton';
import {
  headerForColumnIndex,
  maxRowLength,
  valueAtColumnIndex,
} from '@/components/indicators/metric-combinations-table-utils';

export default function StatPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { activeLang } = useLang();

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

  const [columnSelectedValues, setColumnSelectedValues] = useState<(string | null)[]>([]);

  const columnCount = useMemo(() => maxRowLength(combinations), [combinations]);
  const columnIndexes = useMemo(
    () => Array.from({ length: columnCount }, (_, i) => i),
    [columnCount]
  );

  const ensureLength = (next: (string | null)[]) =>
    next.length >= columnCount
      ? next
      : Array.from({ length: columnCount }, (_, i) => next[i] ?? null);

  const activeFilterCount = useMemo(
    () => columnSelectedValues.reduce((sum, v) => sum + (v ? 1 : 0), 0),
    [columnSelectedValues]
  );

  const columnValueOptions = useMemo(() => {
    if (columnCount === 0) return [];
    return Array.from({ length: columnCount }, (_, ci) => {
      const uniq = new Set<string>();
      for (const combo of combinations) uniq.add(valueAtColumnIndex(combo, ci));
      return Array.from(uniq).sort((a, b) => a.localeCompare(b));
    });
  }, [columnCount, combinations]);

  const filteredCombinations = useMemo(() => {
    if (columnCount === 0) return combinations;
    const active = columnSelectedValues
      .map((v, i) => ({ i, v }))
      .filter(({ v }) => Boolean(v));
    if (active.length === 0) return combinations;
    return combinations.filter((combo) =>
      active.every(({ i, v }) => valueAtColumnIndex(combo, i) === v)
    );
  }, [columnCount, columnSelectedValues, combinations]);

  const [data, setData] = useState([]);
  const [query, setQuery] = useState<string>('');

  return (
    <div className="w-full pt-7.5 pl-16.75 flex flex-col pb-10">
      {isLoading ? (
        <Skeleton className="h-8 w-96 mt-1" />
      ) : (
        <TypographyH3 className="text-[rgba(40,40,40,1)]">{metric?.title?.[activeLang] ?? ""}</TypographyH3>
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
                {metric?.title?.[activeLang] ?? ""}
              </h5>
              <TypographyP className="text-fontSizeS leading-4.75 text-[rgba(125,125,125,1)] mt-3">
                {metric?.description?.[activeLang] ?? ""}
              </TypographyP>
            </>
          )}
          <div className="bg-[rgba(241,245,248,1)] px-3 border-t border-[rgba(15,104,192,1)] pt-4.25 pb-4.75 mt-10">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span className="text-[14px] leading-3.5 text-[rgba(44,44,44,0.65)]">
                  {activeFilterCount > 0 ? `Ֆիլտրեր (${activeFilterCount})` : 'Ֆիլտրեր'}
                </span>
                <button
                  type="button"
                  className="text-xs font-medium text-[rgba(39,81,153,1)] hover:underline disabled:opacity-50"
                  disabled={activeFilterCount === 0}
                  onClick={() =>
                    setColumnSelectedValues(Array.from({ length: columnCount }, () => null))
                  }
                >
                  Մաքրել բոլորը
                </button>
              </div>
              <span className="text-[14px] leading-3.5 text-[rgba(44,44,44,0.65)]">
                {filteredCombinations.length} / {combinations.length}
              </span>
            </div>
            <div className="flex overflow-x-auto gap-4">
              {columnIndexes.map((ci) => {
                const options = columnValueOptions[ci] ?? [];
                const selected = columnSelectedValues[ci] ?? null;
                const label = headerForColumnIndex(combinations, ci);
                return (
                  <Select
                    key={ci}
                    value={selected ?? '__all__'}
                    onValueChange={(val) =>
                      setColumnSelectedValues((prev) => {
                        const copy = ensureLength([...prev]);
                        copy[ci] = val === '__all__' ? null : val;
                        return copy;
                      })
                    }
                  >
                    <SelectTrigger className="border-none text-[rgba(44,44,44,1)] bg-transparent shadow-none px-2 h-9">
                      <SelectValue placeholder={label} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="__all__">{label}</SelectItem>
                        {options.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                );
              })}
            </div>
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
                  <ChartTab combinations={filteredCombinations} isLoading={isLoading} />
                </div>
              </TabsContent>
              <TabsContent value="data">
                <div className="px-7.5 py-5 w-full">
                  <TableTab
                    combinations={combinations}
                    filteredCombinations={filteredCombinations}
                    metricUnit={metric?.unit?.[activeLang] ?? ""}
                    isLoading={isLoading}
                  />
                </div>
              </TabsContent>
              <TabsContent value="metadata">
                <div className="p-6 w-full">
                  {isLoading ? (
                    <div className="flex flex-col gap-3">
                      <Skeleton className="h-6 w-2/3" />
                      <Skeleton className="h-4 w-full mt-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  ) : (
                    <>
                      <h4 className="text-fontSizeM text-[rgba(0,0,0,1)]">
                        {metric?.title?.[activeLang] ?? ""}
                      </h4>
                      {(metric?.metadata as any)?.[activeLang]?.body && (
                        <p className="mt-4 text-fontSizeS leading-4.75 text-[rgba(125,125,125,1)] whitespace-pre-line">
                          {(metric.metadata as any)[activeLang].body}
                        </p>
                      )}
                      {metric?.description?.[activeLang] && (
                        <p className="mt-4 text-fontSizeS leading-4.75 text-[rgba(125,125,125,1)]">
                          {metric.description[activeLang]}
                        </p>
                      )}
                      <div className="flex gap-5 mt-7.5">
                        {metric?.updatedAt && (
                          <p className="text-[rgba(110,127,136,1)] text-[11px]">
                            Թարմացված է՝{' '}
                            {new Date(metric.updatedAt).toLocaleDateString('hy-AM', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                        {((metric?.metadata as any)?.[activeLang]?.sourceUrl || metric?.link?.[activeLang]) && (
                          <p className="text-[rgba(110,127,136,1)] text-[11px]">
                            Աղբյուրը՝{' '}
                            <a
                              href={(metric?.metadata as any)?.[activeLang]?.sourceUrl ?? metric?.link?.[activeLang]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[rgba(39,81,153,1)] hover:underline"
                            >
                              {(metric?.metadata as any)?.[activeLang]?.sourceUrl ?? metric?.link?.[activeLang]}
                            </a>
                          </p>
                        )}
                      </div>
                    </>
                  )}
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
