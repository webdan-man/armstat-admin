"use client";

import React from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type GroupsSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function GroupsSearchField({ value, onChange, className }: GroupsSearchFieldProps) {
  return (
    <div className={cn("flex w-full max-w-[755px]", className)}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Փնտրել"
        className="h-9 rounded-l-[9px] rounded-r-none border-[#c8c8c8] bg-white text-[13px] placeholder:text-[#646464] focus-visible:z-10 md:text-[13px]"
      />
      <Button
        type="button"
        variant="default"
        className="h-9 w-[87px] shrink-0 rounded-l-none rounded-r-[9px] border-0 bg-[#004d99] px-0 text-white hover:bg-[#004080]"
        aria-label="Փնտրել"
        onClick={() => {}}
      >
        <Search className="size-5" strokeWidth={2} />
      </Button>
    </div>
  );
}
