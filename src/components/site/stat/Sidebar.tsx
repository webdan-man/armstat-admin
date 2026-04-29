'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type MenuItem = {
  id: number;
  title: string;
  slug: string;
  children?: MenuItem[];
};

const menu: MenuItem[] = [
  {
    id: 0,
    title: 'Ժողովրդագրություն',
    slug: 'demography',
    children: [
      {
        id: 101,
        title: 'Ենթաթեմա 1',
        slug: 'demography-1',
        children: [
          { id: 1011, title: 'Ենթաթեմա 1.1', slug: 'demography-1-1' },
          { id: 1012, title: 'Ենթաթեմա 1.2', slug: 'demography-1-2' },
        ],
      },
      {
        id: 2,
        title: 'Ենթաթեմա 2',
        slug: 'demography-2',
        children: [
          { id: 21, title: 'Ենթաթեմա 2.1', slug: 'demography-2-1' },
          { id: 22, title: 'Ենթաթեմա 2.2', slug: 'demography-2-2' },
        ],
      },
    ],
  },
  {
    id: 1,
    title: 'Միգրացիա',
    slug: 'migration',
    children: [
      {
        id: 11,
        title: 'Ենթաթեմա 1',
        slug: 'migration-1',
        children: [
          { id: 111, title: 'Ենթաթեմա 1.1', slug: 'migration-1-1' },
          { id: 112, title: 'Ենթաթեմա 1.2', slug: 'migration-1-2' },
        ],
      },
      {
        id: 12,
        title: 'Ենթաթեմա 2',
        slug: 'migration-2',
        children: [
          { id: 121, title: 'Ենթաթեմա 2.1', slug: 'migration-2-1' },
          { id: 122, title: 'Ենթաթեմա 2.2', slug: 'migration-2-2' },
        ],
      },
      {
        id: 13,
        title: 'Ենթաթեմա 3',
        slug: 'migration-3',
        children: [
          { id: 131, title: 'Ենթաթեմա 3.1', slug: 'migration-3-1' },
          { id: 132, title: 'Ենթաթեմա 3.2', slug: 'migration-3-2' },
        ],
      },
      {
        id: 14,
        title: 'Ենթաթեմա 4',
        slug: 'migration-4',
        children: [
          { id: 141, title: 'Ենթաթեմա 4.1', slug: 'migration-4-1' },
          { id: 142, title: 'Ենթաթեմա 4.2', slug: 'migration-4-2' },
        ],
      },
      {
        id: 15,
        title: 'Ենթաթեմա 5',
        slug: 'migration-5',
        children: [
          { id: 151, title: 'Ենթաթեմա 5.1', slug: 'migration-5-1' },
          { id: 152, title: 'Ենթաթեմա 5.2', slug: 'migration-5-2' },
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'Սոցիալական ապահովություն և...',
    slug: 'social-security',
    children: [
      {
        id: 21,
        title: 'Ենթաթեմա 1',
        slug: 'social-1',
        children: [
          { id: 211, title: 'Ենթաթեմա 1.1', slug: 'social-1-1' },
          { id: 212, title: 'Ենթաթեմա 1.2', slug: 'social-1-2' },
        ],
      },
      {
        id: 22,
        title: 'Ենթաթեմա 2',
        slug: 'social-2',
        children: [
          { id: 221, title: 'Ենթաթեմա 2.1', slug: 'social-2-1' },
          { id: 222, title: 'Ենթաթեմա 2.2', slug: 'social-2-2' },
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'Կրթություն և գիտություն',
    slug: 'education-science',
    children: [
      {
        id: 31,
        title: 'Ենթաթեմա 1',
        slug: 'edu-1',
        children: [
          { id: 311, title: 'Ենթաթեմա 1.1', slug: 'edu-1-1' },
          { id: 312, title: 'Ենթաթեմա 1.2', slug: 'edu-1-2' },
        ],
      },
      {
        id: 32,
        title: 'Ենթաթեմա 2',
        slug: 'edu-2',
        children: [
          { id: 321, title: 'Ենթաթեմա 2.1', slug: 'edu-2-1' },
          { id: 322, title: 'Ենթաթեմա 2.2', slug: 'edu-2-2' },
        ],
      },
    ],
  },
  {
    id: 4,
    title: 'Իրավախախտումներ',
    slug: 'violations',
    children: [
      {
        id: 41,
        title: 'Ենթաթեմա 1',
        slug: 'violations-1',
        children: [
          { id: 411, title: 'Ենթաթեմա 1.1', slug: 'violations-1-1' },
          { id: 412, title: 'Ենթաթեմա 1.2', slug: 'violations-1-2' },
        ],
      },
      {
        id: 42,
        title: 'Ենթաթեմա 2',
        slug: 'violations-2',
        children: [
          { id: 421, title: 'Ենթաթեմա 2.1', slug: 'violations-2-1' },
          { id: 422, title: 'Ենթաթեմա 2.2', slug: 'violations-2-2' },
        ],
      },
    ],
  },
  {
    id: 5,
    title: 'Աշխատուժ',
    slug: 'workforce',
    children: [
      {
        id: 51,
        title: 'Ենթաթեմա 1',
        slug: 'workforce-1',
        children: [
          { id: 511, title: 'Ենթաթեմա 1.1', slug: 'workforce-1-1' },
          { id: 512, title: 'Ենթաթեմա 1.2', slug: 'workforce-1-2' },
        ],
      },
      {
        id: 52,
        title: 'Ենթաթեմա 2',
        slug: 'workforce-2',
        children: [
          { id: 521, title: 'Ենթաթեմա 2.1', slug: 'workforce-2-1' },
          { id: 522, title: 'Ենթաթեմա 2.2', slug: 'workforce-2-2' },
        ],
      },
    ],
  },
  {
    id: 6,
    title: 'Աշխատանք. վճարվող և չվճարվող',
    slug: 'paid-unpaid-work',
    children: [
      {
        id: 61,
        title: 'Ենթաթեմա 1',
        slug: 'puw-1',
        children: [
          { id: 611, title: 'Ենթաթեմա 1.1', slug: 'puw-1-1' },
          { id: 612, title: 'Ենթաթեմա 1.2', slug: 'puw-1-2' },
        ],
      },
      {
        id: 62,
        title: 'Ենթաթեմա 2',
        slug: 'puw-2',
        children: [
          { id: 621, title: 'Ենթաթեմա 2.1', slug: 'puw-2-1' },
          { id: 622, title: 'Ենթաթեմա 2.2', slug: 'puw-2-2' },
        ],
      },
    ],
  },
  {
    id: 7,
    title: 'Աշխատաժամեր',
    slug: 'working-hours',
    children: [
      {
        id: 71,
        title: 'Ենթաթեմա 1',
        slug: 'hours-1',
        children: [
          { id: 711, title: 'Ենթաթեմա 1.1', slug: 'hours-1-1' },
          { id: 712, title: 'Ենթաթեմա 1.2', slug: 'hours-1-2' },
        ],
      },
      {
        id: 72,
        title: 'Ենթաթեմա 2',
        slug: 'hours-2',
        children: [
          { id: 721, title: 'Ենթաթեմա 2.1', slug: 'hours-2-1' },
          { id: 722, title: 'Ենթաթեմա 2.2', slug: 'hours-2-2' },
        ],
      },
    ],
  },
  {
    id: 8,
    title: 'Վճարվող և չվճարվող աշխատանքի',
    slug: 'paid-unpaid-labour',
    children: [
      {
        id: 81,
        title: 'Ենթաթեմա 1',
        slug: 'labour-1',
        children: [
          { id: 811, title: 'Ենթաթեմա 1.1', slug: 'labour-1-1' },
          { id: 812, title: 'Ենթաթեմա 1.2', slug: 'labour-1-2' },
        ],
      },
      {
        id: 82,
        title: 'Ենթաթեմա 2',
        slug: 'labour-2',
        children: [
          { id: 821, title: 'Ենթաթեմա 2.1', slug: 'labour-2-1' },
          { id: 822, title: 'Ենթաթեմա 2.2', slug: 'labour-2-2' },
        ],
      },
    ],
  },
  {
    id: 9,
    title: 'Շրջակա միջավայր',
    slug: 'environment',
    children: [
      {
        id: 91,
        title: 'Ենթաթեմա 1',
        slug: 'env-1',
        children: [
          { id: 911, title: 'Ենթաթեմա 1.1', slug: 'env-1-1' },
          { id: 912, title: 'Ենթաթեմա 1.2', slug: 'env-1-2' },
        ],
      },
      {
        id: 92,
        title: 'Ենթաթեմա 2',
        slug: 'env-2',
        children: [
          { id: 921, title: 'Ենթաթեմա 2.1', slug: 'env-2-1' },
          { id: 922, title: 'Ենթաթեմա 2.2', slug: 'env-2-2' },
        ],
      },
    ],
  },
  {
    id: 10,
    title: 'Ժողովրդագրություն',
    slug: 'demography-2',
    children: [
      {
        id: 101,
        title: 'Ենթաթեմա 1',
        slug: 'demography2-1',
        children: [
          { id: 1011, title: 'Ենթաթեմա 1.1', slug: 'demography2-1-1' },
          { id: 1012, title: 'Ենթաթեմա 1.2', slug: 'demography2-1-2' },
        ],
      },
      {
        id: 102,
        title: 'Ենթաթեմա 2',
        slug: 'demography2-2',
        children: [
          { id: 1021, title: 'Ենթաթեմա 2.1', slug: 'demography2-2-1' },
          { id: 1022, title: 'Ենթաթեմա 2.2', slug: 'demography2-2-2' },
        ],
      },
    ],
  },
  {
    id: 11,
    title: 'Ընտանեկան բռնություն',
    slug: 'domestic-violence',
    children: [
      {
        id: 111,
        title: 'Ենթաթեմա 1',
        slug: 'dv-1',
        children: [
          { id: 1111, title: 'Ենթաթեմա 1.1', slug: 'dv-1-1' },
          { id: 1112, title: 'Ենթաթեմա 1.2', slug: 'dv-1-2' },
        ],
      },
      {
        id: 112,
        title: 'Ենթաթեմա 2',
        slug: 'dv-2',
        children: [
          { id: 1121, title: 'Ենթաթեմա 2.1', slug: 'dv-2-1' },
          { id: 1122, title: 'Ենթաթեմա 2.2', slug: 'dv-2-2' },
        ],
      },
    ],
  },
];

type MenuListProps = {
  items?: MenuItem[];
  level?: number;
  expandedPath: number[];
  toggleExpand: (id: number, level: number) => void;
  activeSlug: string;
};

function hasActiveDescendant(item: MenuItem, activeSlug: string): boolean {
  if (!item.children) return false;
  return item.children.some(
    (child) => child.slug === activeSlug || hasActiveDescendant(child, activeSlug),
  );
}

function MenuList({ items, level = 0, expandedPath, toggleExpand, activeSlug }: MenuListProps) {
  const router = useRouter();

  return (
    <ul className="flex flex-col w-full">
      {items?.map((item, index) => {
        const hasChildren = !!item.children?.length;
        const isExpanded = expandedPath[level] === item.id;
        const isActive = item.slug === activeSlug;
        const activeChild = hasActiveDescendant(item, activeSlug);

        const showActive = (level === 0 && (isActive || activeChild)) || (level > 0 && isActive);

        return (
          <li
            key={item.id}
            className={`
              w-full border-b border-b-[rgba(228,228,228,1)]
              ${level > 0 && index === 0 ? 'border-t border-t-[rgba(228,228,228,1)]' : ''}
              ${level > 0 ? 'last:border-none' : ''}
            `}
          >
            <button
              onClick={() => {
                if (hasChildren) {
                  toggleExpand(item.id, level);
                }
                router.push(`/stat/${item.slug}`);
              }}
              style={{ paddingLeft: 16 + level * 16 }}
              className={`
                cursor-pointer w-full text-left text-fontSizeXS py-4 pr-4 flex justify-between items-center
                ${level > 0 ? 'bg-[rgba(241,245,248,1)] font-semibold' : ''}
                ${
                  showActive
                    ? level > 0
                      ? 'border-r-6 border-r-[rgba(22,81,149,1)] text-[rgba(15,104,192,1)]'
                      : 'bg-[rgba(57,127,206,1)] font-semibold text-textBlack100'
                    : 'text-[rgba(55,55,55,1)]'
                }
              `}
            >
              {item.title}
            </button>

            {hasChildren && isExpanded && (
              <MenuList
                items={item.children}
                level={level + 1}
                expandedPath={expandedPath}
                toggleExpand={toggleExpand}
                activeSlug={activeSlug}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function Sidebar() {
  const params = useParams();
  const activeSlug = params.slug as string;

  const [expandedPath, setExpandedPath] = useState<number[]>([]);

  const toggleExpand = (id: number, level: number) => {
    setExpandedPath((prev) => {
      const newPath = prev.slice(0, level);

      if (prev[level] === id) {
        return newPath;
      }

      newPath[level] = id;
      return newPath;
    });
  };

  return (
    <aside className="w-full flex flex-col">
      <div className="flex w-full py-7.5 px-4">
        <p className="text-fontSizeM font-semibold text-[rgba(40,40,40,1)]">Բաժիններ</p>
      </div>

      <nav className="w-full">
        <MenuList
          items={menu}
          expandedPath={expandedPath}
          toggleExpand={toggleExpand}
          activeSlug={activeSlug}
        />
      </nav>
    </aside>
  );
}
