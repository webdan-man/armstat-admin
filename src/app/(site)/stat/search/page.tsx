import { redirect } from "next/navigation";

type StatSearchRedirectPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function StatSearchRedirectPage({ searchParams }: StatSearchRedirectPageProps) {
  const { q } = await searchParams;
  redirect(q ? `/stat?q=${encodeURIComponent(q)}` : "/stat/?search");
}
