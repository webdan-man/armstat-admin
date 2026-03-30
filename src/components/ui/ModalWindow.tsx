"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { XIcon } from "lucide-react";
import {
    DirectionType,
    FieldType,
    Passport,
    UsageType,
    VisibilityModeType,
} from "@/types/passport";
import { ScrollArea } from "@/components/ui/scroll-area";
import { withToastError } from "@/lib/withToastError";
import { CountryGroupsResponse, createPassport } from "@/services/passportsService";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CategoriesResponse } from "@/types/passportFieldCategory";

const RowSchema = z.object({
    nameAm: z.string().min(1, "Required"),
    nameEn: z.string().min(1, "Required"),
    nameRu: z.string().min(1, "Required"),
    countryGroupId: z.number(),
    fieldCategoryId: z.number(),
    fieldType: z.string().min(1, "Required"),
    visibilityMode: z.string().min(1, "Required"),
    direction: z.string().min(1, "Required"),
    usageType: z.string().min(1, "Required"),
    id: z.string().min(1, "Required"),
    connection: z.string(),
    connectionName: z.string(),
    connectionNameEn: z.string(),
    connectionNameRu: z.string(),
});

type RowFormValues = z.infer<typeof RowSchema>;

function enumToOptions<T extends Record<string, string>>(e: T) {
    return Object.values(e).map((value) => ({
        value,
        label: value
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (l) => l.toUpperCase()),
    }));
}

const selectOptions = {
    fieldType: enumToOptions(FieldType),
    visibilityMode: enumToOptions(VisibilityModeType),
    direction: enumToOptions(DirectionType),
    usageType: enumToOptions(UsageType),
};

const fieldLabelsHy: Record<keyof typeof selectOptions, string> = {
    fieldType: "Դաշտի տեսակ",
    visibilityMode: "Տեսանելիություն",
    direction: "Ուղղություն",
    usageType: "Նպատակ",
};

const inputLabelsHy: Record<
    | "id"
    | "nameAm"
    | "nameEn"
    | "nameRu"
    | "connection"
    | "connectionName"
    | "connectionNameEn"
    | "connectionNameRu",
    string
> = {
    id: "ID",
    nameAm: "Անվանումը հայերեն",
    nameEn: "Անվանումը անգլերեն",
    nameRu: "Անվանումը ռուսերեն",
    connection: "Popup կապի ID",
    connectionName: "Կապող վերնագիր / Popup հղում՝ հայերեն",
    connectionNameEn: "Կապող վերնագիր / Popup հղում՝անգլերեն",
    connectionNameRu: "Կապող վերնագիր / Popup հղում՝ ռուսերեն",
};

export default function ModalWindow({
    open,
    setOpen,
    fieldCategories,
    countryGroups,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    fieldCategories: CategoriesResponse;
    countryGroups: CountryGroupsResponse;
}) {
    const countryGroupOptions = countryGroups?.data;

    const form = useForm<RowFormValues>({
        resolver: zodResolver(RowSchema),
        defaultValues: {
            id: "",
            nameAm: "",
            nameEn: "",
            nameRu: "",
            connection: "",
            connectionName: "",
            connectionNameEn: "",
            connectionNameRu: "",
            countryGroupId: 1,
            fieldCategoryId: 1,
            fieldType: FieldType.TEXT,
            visibilityMode: VisibilityModeType.PRIMARY,
            direction: DirectionType.ALL,
            usageType: UsageType.ALL,
        },
    });

    const onSubmit = async (values: RowFormValues) => {
        const result = await withToastError(() => createPassport(values as Passport), {
            title: "Անձնագիրը հաջողությամբ ստեղծվեց!",
            description: "Անձնագիրը ավելացվել է և հասանելի է համակարգում։",
        });

        if (result) {
            form.reset();
            setOpen(false);
        }
    };

    return (
        <Dialog open={open}>
            <DialogContent
                showCloseButton={false}
                className='max-h-[90vh] w-full overflow-y-auto px-10 pb-4 max-md:max-h-[100vh] max-md:max-w-full max-md:px-4 sm:max-w-265'
            >
                <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setOpen(false)}
                    className='text-muted-foreground hover:text-foreground absolute top-4 right-4'
                >
                    <XIcon className='size-6' />
                </Button>

                <DialogHeader>
                    <DialogTitle>
                        <div className='flex items-center gap-5 max-md:gap-2.5'>Ավելացնել դաշտ</div>
                    </DialogTitle>
                </DialogHeader>

                <div className='border-border -mx-10 border-b' />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <ScrollArea className='h-[calc(100vh-250px)]'>
                            <div className='flex flex-col gap-4 pt-4'>
                                {(
                                    [
                                        "id",
                                        "nameAm",
                                        "nameEn",
                                        "nameRu",
                                        "connection",
                                        "connectionName",
                                        "connectionNameEn",
                                        "connectionNameRu",
                                    ] as const
                                ).map((field) => (
                                    <FormField
                                        key={field}
                                        control={form.control}
                                        name={field as keyof RowFormValues}
                                        render={({ field: f }) => (
                                            <FormItem>
                                                <FormLabel>{inputLabelsHy[field]}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder={inputLabelsHy[field]}
                                                        {...f}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                                <FormField
                                    control={form.control}
                                    name={"countryGroupId"}
                                    render={({ field: f }) => (
                                        <FormItem>
                                            <FormLabel>Երկրի խումբ</FormLabel>
                                            <FormControl>
                                                <Select
                                                    {...f}
                                                    onValueChange={(value) => {
                                                        form.setValue(
                                                            "countryGroupId",
                                                            Number(value)
                                                        );
                                                    }}
                                                    value={f.value?.toString() || ""}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={"Երկրի խումբ"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {countryGroupOptions?.map((opt) => (
                                                            <SelectItem
                                                                key={opt.id}
                                                                value={opt.id.toString()}
                                                            >
                                                                {opt.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={"fieldCategoryId"}
                                    render={({ field: f }) => (
                                        <FormItem>
                                            <FormLabel>Կատեգորիա</FormLabel>
                                            <FormControl>
                                                <Select
                                                    {...f}
                                                    onValueChange={(value) => {
                                                        if (typeof f.value === "number") {
                                                            form.setValue(
                                                                "fieldCategoryId",
                                                                Number(value) as any
                                                            );
                                                        } else {
                                                            form.setValue(
                                                                "fieldCategoryId",
                                                                value as any
                                                            );
                                                        }
                                                    }}
                                                    value={f.value?.toString() || ""}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={"Կատեգորիա"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {fieldCategories.data.map((opt) => (
                                                            <SelectItem
                                                                key={opt.id}
                                                                value={opt.id.toString()}
                                                            >
                                                                {opt.type}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {(Object.keys(selectOptions) as (keyof typeof selectOptions)[]).map(
                                    (key) => (
                                        <FormField
                                            key={key}
                                            control={form.control}
                                            name={key as keyof RowFormValues}
                                            render={({ field: f }) => (
                                                <FormItem>
                                                    <FormLabel>{fieldLabelsHy[key]}</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            {...f}
                                                            onValueChange={(value) => {
                                                                if (typeof f.value === "number") {
                                                                    form.setValue(
                                                                        key,
                                                                        Number(value) as any
                                                                    );
                                                                } else {
                                                                    form.setValue(
                                                                        key,
                                                                        value as any
                                                                    );
                                                                }
                                                            }}
                                                            value={f.value?.toString() || ""}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder={fieldLabelsHy[key]}
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {selectOptions[key].map((opt) => (
                                                                    <SelectItem
                                                                        key={opt.value}
                                                                        value={opt.value.toString()}
                                                                    >
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )
                                )}
                            </div>
                        </ScrollArea>
                        <DialogFooter className='mt-4'>
                            <DialogClose asChild>
                                <Button onClick={() => setOpen(false)} variant='outline'>
                                    Չեղարկել
                                </Button>
                            </DialogClose>
                            <Button type='submit'>Պահպանել</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
