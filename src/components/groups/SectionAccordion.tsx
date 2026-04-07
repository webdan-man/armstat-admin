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
    <Accordion type="multiple" defaultValue={[]} className="flex w-full flex-col gap-3">
      {sections.map((section) => {
        const sectionHeadingTopic = {
          ...section,
          title: section.name,
          topics: [],
          sectionId: section._id,
        };
        const topLevelTopics = section.topics.filter((topic) => !topic.parentTopicId);

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
              <ChevronDown
                className="size-5 shrink-0 text-[#2c2c2c] transition-transform duration-200"
                aria-hidden
              />
              <span className="flex-1 text-left text-[14px] leading-[14px] font-medium text-[#2c2c2c]">
                {section.name}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <SectionTopicRow
                key={`${section._id}-heading`}
                topic={sectionHeadingTopic}
                showHeadingPrefix
                siblingTopics={section.topics}
              />
              {topLevelTopics.map((topic) => (
                <React.Fragment key={topic._id}>
                  <SectionTopicRow topic={topic} showHeadingPrefix={false} siblingTopics={section.topics} />
                  {(topic.subtopics ?? []).map((subtopic) => (
                    <SectionTopicRow
                      key={subtopic._id}
                      topic={subtopic}
                      showHeadingPrefix={false}
                      siblingTopics={section.topics}
                      isSubtopic
                    />
                  ))}
                </React.Fragment>
              ))}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
