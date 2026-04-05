"use client";

import React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const fieldBorder =
  "h-9 rounded-[8.5px] border-[rgba(230,231,235,1)] bg-white text-sm text-[#2c2c2c] md:text-sm";

const MainTabs = ({ className }: { className?: string }) => {
  return (
    <Tabs defaultValue="hy" className={cn("w-full gap-5", className)}>
      <TabsList className="h-9 gap-0 rounded-[9px] bg-[#e6e7eb] p-0.5">
        <TabsTrigger
          value="en"
          className="h-full rounded-[8px] px-5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          EN
        </TabsTrigger>
        <TabsTrigger
          value="hy"
          className="h-full rounded-[8px] px-5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          HY
        </TabsTrigger>
        <TabsTrigger
          value="ru"
          className="h-full rounded-[8px] px-5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          RU
        </TabsTrigger>
      </TabsList>
      <TabsContent className="flex w-full flex-col gap-5" value="en">
        <Input className={fieldBorder} />
        <Textarea className="resize-y rounded-[8px] border-[rgba(230,231,235,1)] bg-white text-sm text-[#575757] shadow-none" />
        <div className="grid grid-cols-[1fr_4fr_2fr] gap-5">
          <Label className="text-sm font-medium text-[#575757]">Հղումը՝</Label>
          <Input className={fieldBorder} placeholder="" />
        </div>
        <div className="grid grid-cols-[1fr_4fr_2fr] gap-5">
          <Label className="text-sm font-medium text-[#575757]">Չափման միավերը՝</Label>
          <Input className={fieldBorder} placeholder="" />
          <Field orientation="horizontal">
            <Checkbox id="terms-checkbox-basic" name="terms-checkbox-basic" />
            <FieldLabel htmlFor="terms-checkbox-basic">Գումարվող ցուցանիշ</FieldLabel>
          </Field>
        </div>
      </TabsContent>
      <TabsContent className="flex w-full flex-col gap-5" value="hy">
        <Input className={fieldBorder} />
        <Textarea className="resize-y rounded-[8px] border-[rgba(230,231,235,1)] bg-white text-sm text-[#575757] shadow-none" />
        <div className="grid grid-cols-[1fr_4fr_2fr] gap-5">
          <Label className="text-sm font-medium text-[#575757]">Հղումը՝</Label>
          <Input className={fieldBorder} placeholder="" />
        </div>
        <div className="grid grid-cols-[1fr_4fr_2fr] gap-5">
          <Label className="text-sm font-medium text-[#575757]">Չափման միավերը՝</Label>
          <Input className={fieldBorder} placeholder="" />
          <Field orientation="horizontal">
            <Checkbox id="terms-checkbox-basic" name="terms-checkbox-basic" />
            <FieldLabel htmlFor="terms-checkbox-basic">Գումարվող ցուցանիշ</FieldLabel>
          </Field>
        </div>
      </TabsContent>
      <TabsContent className="flex w-full flex-col gap-5" value="ru">
        <Input className={fieldBorder} />
        <Textarea className="resize-y rounded-[8px] border-[rgba(230,231,235,1)] bg-white text-sm text-[#575757] shadow-none" />
        <div className="grid grid-cols-[1fr_4fr_2fr] gap-5">
          <Label className="text-sm font-medium text-[#575757]">Հղումը՝</Label>
          <Input className={fieldBorder} placeholder="" />
        </div>
        <div className="grid grid-cols-[1fr_4fr_2fr] gap-5">
          <Label className="text-sm font-medium text-[#575757]">Չափման միավերը՝</Label>
          <Input className={fieldBorder} placeholder="" />
          <Field orientation="horizontal">
            <Checkbox id="terms-checkbox-basic" name="terms-checkbox-basic" />
            <FieldLabel htmlFor="terms-checkbox-basic">Գումարվող ցուցանիշ</FieldLabel>
          </Field>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default MainTabs;
