import { AdminShell } from "@/components/admin/admin-shell";
import { RequireAuth } from "@/components/auth/route-guards";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAuth>
      <AdminShell>{children}</AdminShell>
    </RequireAuth>
  );
}
