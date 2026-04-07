"use client";

import React from "react";

import { Button } from "@/components/ui/button";

type GroupsHeaderProps = {
  onAddClick: () => void;
};

export function GroupsHeader({ onAddClick }: GroupsHeaderProps) {
  return (
    <div className="flex min-h-11 w-full items-center justify-between gap-4">
      <h1 className="text-xl leading-6 font-medium text-[#2c2c2c]">Բաժիններ</h1>
      <Button
        type="button"
        className="h-11 rounded-lg border-0 bg-[#004d99] px-6 text-[13px] font-medium text-white hover:bg-[#004080]"
        onClick={onAddClick}
      >
        Ավելացնել
      </Button>
    </div>
  );
}
