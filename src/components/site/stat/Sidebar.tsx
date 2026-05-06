'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import useSWR from 'swr';
import { fetchSections } from '@/services/sectionsService';
import { swrKeys } from '@/lib/swr/cache-keys';
import { isRootTopic } from '@/lib/section-topic-utils';
import type { Section, Topic } from '@/types/section';

type MenuItem = {
  id: string;
  title: string;
  children?: MenuItem[];
};

function buildMenu(sections: Section[]): MenuItem[] {
  return sections.map((section) => ({
    id: section._id,
    title: section.name,
    children: section.topics.filter(isRootTopic).map((rootTopic) => ({
      id: rootTopic._id,
      title: rootTopic.title,
      children: (rootTopic.subtopics ?? []).map((sub) => ({
        id: sub._id,
        title: sub.title,
      })),
    })),
  }));
}

/** Returns the expandedPath needed to make activeSlug visible in the tree. */
function findExpandedPath(items: MenuItem[], activeSlug: string, depth = 0): string[] {
  for (const item of items) {
    if (!item.children?.length) continue;
    for (const child of item.children) {
      if (child.id === activeSlug) {
        // child is directly inside item — we only need to expand item
        return [item.id];
      }
      // recurse into grandchildren
      if (child.children?.length) {
        for (const grand of child.children) {
          if (grand.id === activeSlug) {
            return [item.id, child.id];
          }
        }
      }
    }
  }
  return [];
}

function hasActiveDescendant(item: MenuItem, activeSlug: string): boolean {
  if (!item.children) return false;
  return item.children.some(
    (child) => child.id === activeSlug || hasActiveDescendant(child, activeSlug),
  );
}

type MenuListProps = {
  items: MenuItem[];
  level?: number;
  expandedPath: string[];
  toggleExpand: (id: string, level: number) => void;
  activeSlug: string;
};

function MenuList({ items, level = 0, expandedPath, toggleExpand, activeSlug }: MenuListProps) {
  const router = useRouter();

  return (
    <ul className="flex flex-col w-full">
      {items.map((item, index) => {
        const hasChildren = !!item.children?.length;
        const isExpanded = expandedPath[level] === item.id;
        const isActive = item.id === activeSlug;
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
                router.push(`/stat/${item.id}`, { scroll: false });
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
                items={item.children!}
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

  const { data: sections = [] } = useSWR(swrKeys.sections, fetchSections);

  const menu = buildMenu(sections);

  const [expandedPath, setExpandedPath] = useState<string[]>([]);

  // Auto-expand the tree to reveal the active slug whenever sections load or the URL changes.
  useEffect(() => {
    if (!menu.length || !activeSlug) return;
    const path = findExpandedPath(menu, activeSlug);
    if (path.length) setExpandedPath(path);
  }, [sections, activeSlug]);

  const toggleExpand = (id: string, level: number) => {
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
    <aside className="w-full flex flex-col sticky top-0 self-start">
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
