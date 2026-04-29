'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

const PAGE_SIZE = 20;

const generateData = () =>
  Array.from({ length: 200 }).map((_, i) => ({
    time: 1990 + (i % 30),
    age: `${i % 10}-${(i % 10) + 5}`,
    region: ['Արարատ', 'Լոռի', 'Շիրակ'][i % 3],
    gender: i % 2 === 0 ? 'Տղամարդ' : 'Կին',
    count: Math.floor(Math.random() * 50000),
  }));

const headers = [
  { label: 'Ժամանակային Շարք', key: 'time' },
  { label: 'Տարիք', key: 'age' },
  { label: 'Մարզեր', key: 'region' },
  { label: 'Սեռ', key: 'gender' },
  { label: 'Քանակ', key: 'count' },
];

const TableTab = () => {
  const allData = useMemo(() => generateData(), []);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sortBy, setSortBy] = useState<keyof (typeof allData)[0]>('time');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const observerRef = useRef<HTMLDivElement | null>(null);

  const sortedData = useMemo(() => {
    const sorted = [...allData].sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return order === 'asc' ? -1 : 1;
      if (a[sortBy] > b[sortBy]) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [allData, sortBy, order]);

  const visibleData = sortedData.slice(0, visibleCount);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, sortedData.length));
      }
    });

    if (observerRef.current) observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [sortedData.length]);

  const handleSort = (field: typeof sortBy) => {
    const newOrder = sortBy === field && order === 'asc' ? 'desc' : 'asc';

    setSortBy(field);
    setOrder(newOrder);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="w-full overflow-y-auto h-200 relative">
        <div className="grid grid-cols-[3fr_2fr_2fr_2fr_2fr] border-b py-3 sticky top-0 bg-white z-10">
          {headers.map((h) => (
            <button
              key={h.key}
              onClick={() => handleSort(h.key as any)}
              className="text-left text-[12px] font-medium pr-5 flex items-center justify-between gap-[4px] text-[rgba(40,40,40,1)]"
            >
              {h.label}{' '}
              {sortBy === h.key ? (
                order === 'asc' ? (
                  <img src="/arrowTop.svg" alt="sort up" />
                ) : (
                  <img src="/arrowTop.svg" className="rotate-180" alt="sort down" />
                )
              ) : (
                ''
              )}
            </button>
          ))}
        </div>

        {visibleData.map((row, i) => (
          <div key={i} className="grid grid-cols-[3fr_2fr_2fr_2fr_2fr] border-b">
            <p className="text-[12px] pt-3.75 pb-4.5 text-[rgba(40,40,40,1)]">{row.time}</p>
            <p className="text-[12px] pt-3.75 pb-4.5 text-[rgba(40,40,40,1)]">{row.age}</p>
            <p className="text-[12px] pt-3.75 pb-4.5 text-[rgba(40,40,40,1)]">{row.region}</p>
            <p className="text-[12px] pt-3.75 pb-4.5 text-[rgba(40,40,40,1)]">{row.gender}</p>
            <p className="text-[12px] pt-3.75 pb-4.5 text-[rgba(40,40,40,1)]">
              {row.count.toLocaleString()}
            </p>
          </div>
        ))}

        {visibleCount < sortedData.length && (
          <div
            ref={observerRef}
            className="h-10 flex items-center justify-center text-xs text-gray-400"
          >
            Loading more...
          </div>
        )}
      </div>
      <div className="flex justify-between gap-5">
        <div className="flex gap-5">
          <p className="text-[rgba(110,127,136,1)] text-[11px]">Թարմացված է՝ 20/05/2024, 16:43</p>
          <p className="text-[rgba(110,127,136,1)] text-[11px]">
            Աղբյուրը՝ <span className="text-[rgba(39,81,153,1)]">Հղման անվանումը կարճ</span>
          </p>
        </div>
        <p className="text-[rgba(110,127,136,1)] text-[11px]">Դիտված է 1,343 անգամ</p>
      </div>
    </div>
  );
};

export default TableTab;
