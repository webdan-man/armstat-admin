"use client";

import React from "react";
import useSWR from "swr";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { fetchAttributes } from "@/services/attributeService";
import { Loader2 } from "lucide-react";

/** Optional Armenian labels for the vertical header row; falls back to column code. */
const columnLabels: Record<string, string> = {};

const thClass = "bg-background sticky top-0 z-20";

const columnOrder = [
    "IB01",
    "PR01",
    "PR02",
    "PR03",
    "PR04",
    "PR05",
    "PR06",
    "EN01",
    "EN02",
    "EN03",
    "EN04",
    "EN05",
    "EN06",
    "HM01",
    "PW01",
    "EP01",
    "MG01",
    "VL01",
    "AG01",
    "2400",
    "10",
];

export default function AttributesPage() {
    const { data, error, isLoading, isValidating, mutate } = useSWR(
        "attributes",
        () => fetchAttributes(),
        {
            revalidateOnFocus: false,
        }
    );

    console.log(data);

    const rows = data ?? [];

    const columns = Object.keys(rows[0] ?? {})
        .sort((a, b) => columnOrder.indexOf(a) - columnOrder.indexOf(b))
        .filter((col) => col !== "id");

    return (
        <div>
            <h1 className='mb-4 text-2xl font-bold'>Տվյալներ</h1>

            <div className='h-[calc(100vh-164px)] w-full overflow-y-auto'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className={thClass}>Կատեգորիա</TableHead>
                            <TableHead className={thClass}>Տեսակ</TableHead>
                            <TableHead className={thClass}>Հայ am</TableHead>
                            <TableHead className={thClass}>Հայ ru</TableHead>
                            <TableHead className={thClass}>Հայ em </TableHead>
                            <TableHead className={thClass}>secondary am</TableHead>
                            <TableHead className={thClass}>secondary ru</TableHead>
                            <TableHead className={thClass}>secondary em </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {data?.map((attribute) => {
                            const { values } = attribute;

                            return values.map((value) => {
                                const parent = values.find((item) => item.parent === value.key);

                                return (
                                    <TableRow key={value.key}>
                                        <TableCell>{attribute.category}</TableCell>
                                        <TableCell>{attribute.key}</TableCell>

                                        {parent && (
                                            <>
                                                <TableCell>{parent.translations.am}</TableCell>
                                                <TableCell>{parent.translations.ru}</TableCell>
                                                <TableCell>{parent.translations.en} </TableCell>
                                            </>
                                        )}

                                        <TableCell>{value.translations.am}</TableCell>
                                        <TableCell>{value.translations.ru}</TableCell>
                                        <TableCell>{value.translations.en} </TableCell>
                                    </TableRow>
                                );
                            });
                        })}
                    </TableBody>
                </Table>

                {isLoading && (
                    <div className='flex w-full justify-center py-2'>
                        <Loader2 className='size-13 animate-spin' />
                    </div>
                )}
            </div>
        </div>
    );
}
