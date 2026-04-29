'use client';

import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import React, { useMemo, useEffect } from 'react';

const frameworks = [
  'ՀՀ կացության կարգավիճակ ստացած օտարերկրացիների բաշխումն  ըստ կարգավիճակի տեսակի և տարիքային խմբերի',
  'ՀՀ մշտական կացության կարգավիճակ ստացած օտարերկրացիներ',
  'ՀՀ կացության կարգավիճակ ստացած օտարերկրացիների բաշխումն  ըստ կարգավիճակի տեսակի և տարիքային խմբերի',
  'ՀՀ մշտական կացության կարգավիճակ ստացած օտարերկրացիներ',
  'ՀՀ մշտական կացության կարգավիճակ ստացած օտարերկրացիներ',
  'ՀՀ կացության կարգավիճակ ստացած օտարերկրացիների բաշխումն  ըստ կարգավիճակի տեսակի և տարիքային խմբերի',
  'ՀՀ մշտական կացության կարգավիճակ ստացած օտարերկրացիներ',
  'ՀՀ մշտական կացության կարգավիճակ ստացած օտարերկրացիներ',
];

const options = frameworks.map((label, index) => ({
  label,
  value: index,
}));

export default function SearchInput({
  query,
  setQuery,
  setData,
}: {
  query: string;
  setQuery: any;
  setData: any;
}) {
  const filteredItems = useMemo(() => {
    if (!query) return frameworks;

    return frameworks.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  useEffect(() => {
    if (query && filteredItems.length === 0) {
      setData(null);
    }
  }, [filteredItems, setData, query]);

  return (
    <Combobox items={options} itemToStringValue={(framework: { label: string }) => framework.label}>
      <ComboboxInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="text-[rgba(55,71,79,1)] border-textBlack300 shadow-none w-full h-10.5"
        placeholder="Փնտրել"
      />
      <ComboboxContent>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
