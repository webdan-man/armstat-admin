"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const formSchema = z.object({
    email: z.email({ message: "Please enter a valid email." }),
    password: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginForm({ nextPath }: { nextPath: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: FormValues) {
        setLoading(true);
        try {
            console.log("Submitting form with values:", values);
            const res = await fetch("/api/login", {
                method: "POST",
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const data = await res.text();
                alert(data || "Login failed");
                return;
            }

            router.push(nextPath);
        } catch (err) {
            console.error(err);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className='bg-muted/20 flex min-h-screen items-center justify-center px-4'>
                <Card className='w-full max-w-sm'>
                    <CardHeader>
                        <CardTitle>Sign in</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                                <FormField
                                    control={form.control}
                                    name='email'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder='admin@example.com'
                                                    type='email'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Enter your admin email address.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='password'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder='********'
                                                    type='password'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Your account password.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type='submit' className='w-full' disabled={loading}>
                                    {loading ? "Signing in..." : "Sign In"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
