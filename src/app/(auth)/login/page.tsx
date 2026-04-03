import LoginForm from "@/components/auth/login-form";

type LoginPageProps = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const params = await searchParams;
    const rawNext = params.next;
    const nextPath = typeof rawNext === "string" && rawNext.startsWith("/") ? rawNext : "/admin";

    return <LoginForm nextPath={nextPath} />;
}
