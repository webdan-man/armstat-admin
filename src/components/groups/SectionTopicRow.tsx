"use client";

import React from "react";
import { toast } from "sonner";

import type { Topic } from "@/types/section";
import { cn } from "@/lib/utils";

type SectionTopicRowProps = {
  topic: Topic;
  showHeadingPrefix: boolean;
};

export function SectionTopicRow({ topic, showHeadingPrefix }: SectionTopicRowProps) {
  return (
    <div
      className={cn(
        "flex h-[45px] items-center justify-between gap-4 border-b border-[#e6e7eb] px-4 last:border-b-0 sm:pl-[29px]"
      )}
    >
      <p className="min-w-0 flex-1 text-[14px] leading-[14px] text-[#2c2c2c]">
        {showHeadingPrefix ? (
          <>
            <span className="text-[#747474]">Վերնագիր: </span>
            <span>{topic.title}</span>
          </>
        ) : (
          topic.title
        )}
      </p>
      <div className="flex shrink-0 items-center gap-6">
        <button
          type="button"
          className="text-[13px] leading-[14px] text-[#275199] underline-offset-2 hover:underline"
          onClick={() => toast.message("Խմբագրումը կկապվի API-ի հետ։")}
        >
          Խմբագրել
        </button>
        <button
          type="button"
          className="text-[13px] leading-[14px] text-[#c00] underline-offset-2 hover:underline"
          onClick={() => toast.message("Ջնջումը կկապվի API-ի հետ։")}
        >
          Ջնջել
        </button>
      </div>
    </div>
  );
}
