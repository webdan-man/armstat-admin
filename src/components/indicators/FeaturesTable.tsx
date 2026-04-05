"use client";

import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const tableData = [
  {
    id: 0,
    name: "Արտակարգ Դեպքերի Տեսակներ",
    library: "Արտակարգ Դեպքեր",
    level: "Հիմնական",
  },
  {
    id: 1,
    name: "Արտակարգ Ենթատեսակներ",
    library: "Արտակարգ Դեպքեր",
    level: "Եկրորդային",
  },
];

export default function FeaturesTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-[14px] leading-3.5">Անվանում</TableHead>
          <TableHead className="text-[14px] leading-3.5">Գրադարան</TableHead>
          <TableHead className="text-[14px] leading-3.5">Մակարդակ</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tableData.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="py-5 text-[14px] leading-3.5">{invoice.name}</TableCell>
            <TableCell className="py-5 text-[14px] leading-3.5">{invoice.library}</TableCell>
            <TableCell className="py-5 text-[14px] leading-3.5">{invoice.level}</TableCell>
            <TableCell className="py-5">
              <div className="flex h-full w-full items-center justify-end gap-6.75">
                <button className="text-[13px] leading-3.5 text-[rgba(39,81,153,1)] transition-all duration-300 hover:underline">
                  Խմբագրել
                </button>
                <button className="transition-underline text-[13px] leading-3.5 text-[rgba(204,0,0,1)] duration-300 hover:underline">
                  Ջնջել
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
