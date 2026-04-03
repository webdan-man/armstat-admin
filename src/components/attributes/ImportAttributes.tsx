"use client";

import React, { useMemo, useRef, useState } from "react";
import {
    createAttribute,
    fetchAttributeCategories,
    fetchAttributes,
    importAttributesFromCSV,
} from "@/services/attributeService";
import { withToastError } from "@/lib/withToastError";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import useSWR, { useSWRConfig } from "swr";

const ADD_NEW_KEY_VALUE = "__add_new__";

/** Latin letters, digits, underscore, hyphen; must start with a letter (English-style key). */
const ENGLISH_ATTRIBUTE_KEY_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

const schema = z
    .object({
        category: z.string().min(1, "Ընտրեք տեսակը"),
        key: z.string().min(1, "Ընտրեք գրադարանը"),
        newKey: z.string().optional(),
        file: z
            .instanceof(File, { message: "Ֆայլը պարտադիր է" })
            .refine((f) => f.size > 0, "Ֆայլը պարտադիր է"),
    })
    .superRefine((val, ctx) => {
        if (val.key === ADD_NEW_KEY_VALUE) {
            const trimmed = (val.newKey ?? "").trim();
            if (!trimmed) {
                ctx.addIssue({
                    code: "custom",
                    path: ["newKey"],
                    message: "Մուտքագրեք նոր գրադարանը",
                });
                return;
            }
            if (!ENGLISH_ATTRIBUTE_KEY_REGEX.test(trimmed)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["newKey"],
                    message:
                        "Գրադարանի անունը պետք է լինի անգլերեն (լատինատառ), սկսվի տառով, թույլատրվում են թվեր, _ և -",
                });
            }
        }
    });

type FormValues = z.infer<typeof schema>;

export default function ImportAttributes() {
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { mutate } = useSWRConfig();

    const { data: attributesList } = useSWR("attributes", () => fetchAttributes(), {
        revalidateOnFocus: false,
    });

    const { data: attributesCategories = [] } = useSWR(
        "attributesCategories",
        () => fetchAttributeCategories(),
        {
            revalidateOnFocus: false,
        }
    );

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { category: "", key: "", newKey: "" },
        mode: "onSubmit",
    });

    const {
        setValue,
        reset,
        formState: { errors },
        watch,
    } = form;

    const selectedCategory = watch("category");
    const selectedKey = watch("key");

    const onSubmit = async (data: FormValues) => {
        console.log("Submitting:", data, data.file.name);
        try {
            setIsUploading(true);

            let keyToUse = data.key;
            if (keyToUse === ADD_NEW_KEY_VALUE) {
                const created = await withToastError(
                    () =>
                        createAttribute({
                            category: data.category,
                            key: (data.newKey ?? "").trim(),
                        }),
                    {
                        title: "Գրադարանը ստեղծվեց հաջողությամբ:",
                    }
                );

                if (!created?.key) return;

                keyToUse = created.key;
                await mutate("attributes");
            }

            await withToastError(
                () => importAttributesFromCSV({ file: data.file, key: keyToUse }),
                {
                    title: "Ֆայլը բեռնվել է հաջողությամբ:",
                    description: "Ֆայլը հաջողությամբ բեռնվել և մշակվել է:",
                }
            );

            reset({ category: "", key: "", newKey: "" });

            if (fileRef.current) {
                fileRef.current.value = "";
            }
        } finally {
            setIsUploading(false);
        }
    };

    const categories = useMemo(() => {
        return Array.from(attributesCategories).sort((a, b) => a.localeCompare(b));
    }, [attributesCategories]);

    const keys = useMemo(() => {
        const set = new Set<string>();
        attributesList?.forEach((a) => selectedCategory === a.category && set.add(a.key));
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [attributesList, selectedCategory]);

    return (
        <div className='flex w-full flex-col'>
            <h1 className='mb-4 text-2xl font-bold'>Տվյալների ներմուծում</h1>

            <div className='flex w-full flex-col'>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit, (errors) => console.log(errors))}
                        className='space-y-4'
                    >
                        <div className='flex gap-4 pb-5'>
                            <div>
                                <FormField
                                    control={form.control}
                                    name='category'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Տեսակ</FormLabel>
                                            <FormControl>
                                                <Select
                                                    value={field.value ? field.value : "__none__"}
                                                    onValueChange={(v) => {
                                                        field.onChange(v === "__none__" ? "" : v);
                                                        form.setValue("key", "");
                                                        form.setValue("newKey", "");
                                                    }}
                                                >
                                                    <SelectTrigger className='w-[180px]'>
                                                        <SelectValue placeholder='Ընտրեք լեզուն' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectItem
                                                                value='__none__'
                                                                className='text-muted-foreground'
                                                            >
                                                                Չընտրված
                                                            </SelectItem>
                                                            {categories.map((category) => (
                                                                <SelectItem
                                                                    key={category}
                                                                    value={category}
                                                                >
                                                                    <span className='font-medium text-emerald-800 dark:text-emerald-200'>
                                                                        {category}
                                                                    </span>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div>
                                <FormField
                                    control={form.control}
                                    name='key'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Գրադարան</FormLabel>
                                            <FormControl>
                                                <Select
                                                    value={field.value ? field.value : "__none__"}
                                                    onValueChange={(v) => {
                                                        const nextValue = v === "__none__" ? "" : v;
                                                        field.onChange(nextValue);
                                                        if (nextValue !== ADD_NEW_KEY_VALUE) {
                                                            form.setValue("newKey", "");
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className='w-[180px]'>
                                                        <SelectValue placeholder='Ընտրեք լեզուն' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectItem
                                                                value='__none__'
                                                                className='text-muted-foreground'
                                                            >
                                                                Չընտրված
                                                            </SelectItem>
                                                            <SelectItem value={ADD_NEW_KEY_VALUE}>
                                                                <span className='font-medium'>
                                                                    Add new
                                                                </span>
                                                            </SelectItem>
                                                            {keys.map((key) => (
                                                                <SelectItem value={key} key={key}>
                                                                    <span className='font-medium text-emerald-800 dark:text-emerald-200'>
                                                                        {key}
                                                                    </span>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {selectedKey === ADD_NEW_KEY_VALUE && (
                                <div>
                                    <FormField
                                        control={form.control}
                                        name='newKey'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Նոր գրադարան</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        value={field.value ?? ""}
                                                        onChange={field.onChange}
                                                        className='w-[180px]'
                                                        lang='en'
                                                        spellCheck={false}
                                                        autoComplete='off'
                                                        placeholder='e.g. library_key'
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            <div>
                                <FormLabel className='mb-2'>Ֆայլ</FormLabel>
                                <Input
                                    type='file'
                                    accept='.csv,.zip'
                                    ref={fileRef}
                                    className='w-80'
                                    onChange={(e) => {
                                        const f = e.target.files?.[0] ?? null;
                                        if (f) setValue("file", f, { shouldValidate: true });
                                    }}
                                />
                                {errors.file && (
                                    <p style={{ color: "crimson" }}>{errors.file.message}</p>
                                )}
                            </div>
                            <Button type='submit' className='mt-5'>
                                {isUploading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                                {isUploading ? "Բեռնվում է..." : "Ներմուծել"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
