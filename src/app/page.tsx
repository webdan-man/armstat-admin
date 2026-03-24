import Link from "next/link";
import { redirect } from "next/navigation";

type HomePageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  if (!params.demo) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Link className="underline" href="/login">
        Go to login
      </Link>
    </div>
  );
}
