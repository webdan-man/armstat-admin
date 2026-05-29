"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useSWRConfig } from "swr";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditSubgroupDialog } from "@/components/groups/EditSubgroupDialog";
import { swrKeys } from "@/lib/swr/cache-keys";
import { withToastError } from "@/lib/withToastError";
import { deleteSection, deleteTopic } from "@/services/sectionsService";
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutate } = useSWRConfig();

  const titleContent = showHeadingPrefix ? (
    <>
      <span className="text-[#747474]">Վերնագիր: </span>
      <span>{topic.title}</span>
    </>
  ) : (
    topic.title
  );

  const handleOpenEditDialog = () => setOpen(true);

  const handleDelete = async () => {
    setIsDeleting(true);
    let success = false;
    try {
      await withToastError(
        async () => {
          if (showHeadingPrefix) {
            await deleteSection(topic._id);
          } else {
            await deleteTopic(topic._id);
          }
          success = true;
        },
        { title: showHeadingPrefix ? "Բաժինը ջնջվել է" : "Ենթախումբը ջնջվել է" }
      );
      if (!success) return;
      await mutate(swrKeys.sections);
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

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
            onClick={() => setDeleteDialogOpen(true)}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[20px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[18px] font-semibold text-[#2c2c2c]">
              Հաստատե՞լ ջնջումը
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-[#646464]">
              «{topic.title}» կջնջվի անդառնալիորեն։
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="h-11 w-[140px] rounded-[8px] border-[#e0e0e0] text-[13px] font-semibold text-[#2c2c2c]"
            >
              Չեղարկել
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="h-11 w-[140px] rounded-[8px] border-0 bg-[#c00] text-[13px] font-semibold text-white hover:bg-[#a00]"
            >
              {isDeleting ? <Loader2 className="size-4 animate-spin" /> : "Ջնջել"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
