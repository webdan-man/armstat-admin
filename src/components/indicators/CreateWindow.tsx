"use client";

import React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateWindow() {
  const [features, setFeatures] = React.useState<{ id: number }[]>([{ id: 0 }]);

  return (
    <Dialog>
      <DialogTrigger className="mt-2 self-center">
        <div className="flex cursor-pointer items-center gap-3.25 self-center">
          <Image src="/add.svg" width="24" height={24} alt={"add"} />
          <span className="text-[14px] leading-3.5 font-medium text-[rgba(39,81,153,1)]">
            Ավել Հատկանիշ
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader className="px-6 py-5">
          <DialogTitle className="text-[18px] leading-3.5 font-semibold text-[rgba(44,44,44,1)]">
            Հատկանիշ
          </DialogTitle>
        </DialogHeader>
        <div className="no-scrollbar -mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex w-full flex-col">
            {features.map((item, index) => (
              <Collapsible
                key={item.id}
                className="w-full rounded-none border-b border-b-[rgba(217,217,217,1)] pt-3.5"
              >
                <div className="flex w-full items-end gap-2.25 pr-10 pb-6 pl-2.5">
                  <CollapsibleTrigger className={"group mb-1.25"}>
                    <ChevronDownIcon className="size-5 group-data-panel-open:rotate-90" />
                  </CollapsibleTrigger>
                  <div className="flex w-full flex-col items-start gap-1.75">
                    <p className="text-start text-xs leading-3.5 font-semibold text-[rgba(87,87,87,1)]">{`Հատկանիշ ${index + 1}`}</p>
                    <Input className="rounded-[9px] border border-[rgba(230,231,235,1)]" />
                  </div>
                </div>
                <CollapsibleContent className="flex w-full flex-col gap-4 border-t border-t-[rgba(217,217,217,1)] bg-[rgba(217,217,217,0.1)] px-10 py-4.25">
                  <Field className="w-full">
                    <FieldLabel className="text-[12px] leading-3.5 font-semibold text-[rgba(87,87,87,1)]">
                      Ընտրել Տեսակը
                    </FieldLabel>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Ընտրել" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="apple">Apple</SelectItem>
                          <SelectItem value="banana">Banana</SelectItem>
                          <SelectItem value="blueberry">Blueberry</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError />
                  </Field>
                  <Field className="w-full">
                    <FieldLabel className="text-[12px] leading-3.5 font-semibold text-[rgba(87,87,87,1)]">
                      Գրադարան
                    </FieldLabel>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Ընտրել" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="apple">Apple</SelectItem>
                          <SelectItem value="banana">Banana</SelectItem>
                          <SelectItem value="blueberry">Blueberry</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError />
                  </Field>
                  <Field className="w-full">
                    <FieldLabel className="text-[12px] leading-3.5 font-semibold text-[rgba(87,87,87,1)]">
                      Ընտրել Մակարդակ
                    </FieldLabel>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Ընտրել" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="apple">Apple</SelectItem>
                          <SelectItem value="banana">Banana</SelectItem>
                          <SelectItem value="blueberry">Blueberry</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError />
                  </Field>
                  <Field className="w-full">
                    <FieldLabel className="text-[12px] leading-3.5 font-semibold text-[rgba(87,87,87,1)]">
                      Գրադարան Արժեքներ
                    </FieldLabel>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Ընտրել" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="apple">Apple</SelectItem>
                          <SelectItem value="banana">Banana</SelectItem>
                          <SelectItem value="blueberry">Blueberry</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError />
                  </Field>
                  <div>
                    <Button
                      disabled
                      className="h-11 rounded-[8px] border-transparent bg-[#004d99] px-10 text-[13px] leading-3.5 font-semibold text-white hover:bg-[#004d99]/90 hover:text-white"
                    >
                      Պահպանել
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
          <div className="w-full px-10 py-9">
            <button
              onClick={() => setFeatures((prev) => [...prev, { id: prev.length + 1 }])}
              className="flex cursor-pointer items-center gap-3.25 self-center"
            >
              <Image src="/add.svg" width="24" height={24} alt={"add"} />
              <span className="text-[14px] leading-3.5 font-medium text-[rgba(39,81,153,1)]">
                Ավելացնել հատկանիշ
              </span>
            </button>
          </div>
        </div>
        <DialogFooter className="border-none bg-white">
          <DialogClose>
            <Button
              variant="outline"
              className="h-11 rounded-[8px] bg-white px-10 text-[13px] leading-3.5 font-semibold text-[rgba(44,44,44,1)]"
            >
              Չեղարկել
            </Button>
          </DialogClose>
          <Button className="h-11 rounded-[8px] border-transparent bg-[#004d99] px-10 text-[13px] leading-3.5 font-semibold text-white hover:bg-[#004d99]/90 hover:text-white">
            Չեղարկել
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
