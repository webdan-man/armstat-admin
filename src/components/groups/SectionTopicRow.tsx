"use client";

import React, { useState } from "react";

import { EditSubgroupDialog } from "@/components/groups/EditSubgroupDialog";
import type { Topic } from "@/types/section";
import { cn } from "@/lib/utils";

type SectionTopicRowProps = {
  topic: Topic;
  showHeadingPrefix: boolean;
  siblingTopics: Topic[];
  isSubtopic?: boolean;
};

export function SectionTopicRow({
  topic,
  showHeadingPrefix,
  siblingTopics,
  isSubtopic = false,
}: SectionTopicRowProps) {
  const [open, setOpen] = useState(false);

  const titleContent = showHeadingPrefix ? (
    <>
      <span className="text-[#747474]">Վերնագիր: </span>
      <span>{topic.title}</span>
    </>
  ) : (
    topic.title
  );

  const handleOpenEditDialog = () => setOpen(true);

  return (
    <>
      <div
        className={cn(
          "flex h-[45px] items-center justify-between gap-4 border-b border-[#e6e7eb] px-4 last:border-b-0 sm:pl-[29px]",
          isSubtopic && "pl-[40px] sm:pl-[40px]"
        )}
      >
        <p className="min-w-0 flex-1 text-[14px] leading-[14px] text-[#2c2c2c]">{titleContent}</p>
        <div className="flex shrink-0 items-center gap-6">
          <button
            type="button"
            className="text-[13px] leading-[14px] text-[#275199] underline-offset-2 hover:underline"
            onClick={handleOpenEditDialog}
          >
            Խմբագրել
          </button>
          <button
            type="button"
            className="text-[13px] leading-[14px] text-[#c00] underline-offset-2 hover:underline"
          >
            Ջնջել
          </button>
        </div>
      </div>
      <EditSubgroupDialog
        open={open}
        onOpenChange={setOpen}
        topic={topic}
        headingTopic={showHeadingPrefix}
        siblingTopics={siblingTopics}
      />
    </>
  );
}
