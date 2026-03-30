"use client";

import React, { useMemo, useState } from "react";
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
import AttributesExportButton from "@/components/attributes/AttributesExportButton";

const thClass = "bg-background sticky top-0 z-20";

export default function AttributesList() {
    const { data, isLoading } = useSWR("attributes", () => fetchAttributes(), {
        revalidateOnFocus: false,
    });

    const [categoryFilter, setCategoryFilter] = useState<string>("__all__");
    const [keyFilter, setKeyFilter] = useState<string>("__all__");

    const categories = useMemo(() => {
        const set = new Set<string>();
        data?.forEach((a) => a.category && set.add(a.category));
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [data]);

    const keys = useMemo(() => {
        const set = new Set<string>();
        const shouldInclude =
            categoryFilter === "__all__"
                ? () => true
                : (category: string) => category === categoryFilter;

        for (const a of data ?? []) {
            if (shouldInclude(a.category)) set.add(a.key);
        }

        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [data, categoryFilter]);

    const filtered = useMemo(() => {
        if (!data) return [];
        return data.filter((a) => {
            if (categoryFilter !== "__all__" && a.category !== categoryFilter) return false;
            return !(keyFilter !== "__all__" && a.key !== keyFilter);
        });
    }, [data, categoryFilter, keyFilter]);

    return (
        <div>
            <h1 className='mb-4 text-2xl font-bold'>Տվյալներ</h1>

            <div className='flex items-center justify-between'>
                <div className='my-8 flex flex-wrap gap-3'>
                    <label className='flex items-center gap-2 text-sm'>
                        <span className='text-muted-foreground'>Տեսակ</span>
                        <select
                            className='border-input bg-background h-9 rounded-md border px-3 text-sm'
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                setKeyFilter("__all__");
                            }}
                        >
                            <option value='__all__'>Բոլորը</option>
                            {categories.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className='flex items-center gap-2 text-sm'>
                        <span className='text-muted-foreground'>Բանալին</span>
                        <select
                            className='border-input bg-background h-9 rounded-md border px-3 text-sm'
                            value={keyFilter}
                            onChange={(e) => setKeyFilter(e.target.value)}
                        >
                            <option value='__all__'>Բոլորը</option>
                            {keys.map((k) => (
                                <option key={k} value={k}>
                                    {k}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <AttributesExportButton />
            </div>

            <div className='h-[calc(100vh-164px)] w-full overflow-y-auto'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className={thClass}>Տեսակ</TableHead>
                            <TableHead className={thClass}>Գրադարան</TableHead>
                            <TableHead className={thClass}>Հիմնական հայերեն</TableHead>
                            <TableHead className={thClass}>Հիմնական ռուսերեն</TableHead>
                            <TableHead className={thClass}>Հիմնական անգլերեն</TableHead>
                            <TableHead className={thClass}>Երկրորդային հայերեն</TableHead>
                            <TableHead className={thClass}>Երկրորդային ռուսերեն</TableHead>
                            <TableHead className={thClass}>Երկրորդային անգլերեն</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filtered.map((attribute) => {
                            const { values } = attribute;

                            return values
                                .sort((a, b) => {
                                    const aHasParent = a.parent ? 1 : 0;
                                    const bHasParent = b.parent ? 1 : 0;

                                    return bHasParent - aHasParent; // parents first
                                })
                                .map((value) => {
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
