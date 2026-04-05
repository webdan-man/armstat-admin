"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionTopicRow } from "@/components/groups/SectionTopicRow";
import type { Section } from "@/types/section";
import { cn } from "@/lib/utils";

type SectionAccordionProps = {
  sections: Section[];
};

export function SectionAccordion({ sections }: SectionAccordionProps) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <Accordion
      type="multiple"
      defaultValue={[]}
      className="flex w-full flex-col gap-3"
    >
      {sections.map((section) => {
        const topics = [...section.topics].sort((a, b) => a.order - b.order);
        return (
          <AccordionItem
            key={section._id}
            value={section._id}
            className="overflow-hidden rounded-[10px] border-0 bg-white shadow-[0px_6px_7px_0px_rgba(0,0,0,0.05)]"
          >
            <AccordionTrigger
              className={cn(
                "min-h-16 items-center gap-2.5 border-0 px-4 py-0 hover:no-underline",
                "data-[state=open]:border-b data-[state=open]:border-[#e6e7eb]",
                "[&>svg]:-rotate-90 [&[data-state=open]>svg]:rotate-0"
              )}
            >
              <ChevronDown className="size-5 shrink-0 text-[#2c2c2c] transition-transform duration-200" aria-hidden />
              <span className="flex-1 text-left text-[14px] font-medium leading-[14px] text-[#2c2c2c]">
                {section.name}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              {topics.length === 0 ? (
                <p className="px-4 py-3 text-sm text-[#646464]">Թեմաներ չկան։</p>
              ) : (
                topics.map((topic, index) => (
                  <SectionTopicRow
                    key={topic._id}
                    topic={topic}
                    showHeadingPrefix={index === 0}
                  />
                ))
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
