import CreateForm from "@/components/users/CreateForm";
import { requirePermission } from "@/lib/require-permission";

export default async function UsersPage() {
  await requirePermission("user");

  return <CreateForm />;
}
