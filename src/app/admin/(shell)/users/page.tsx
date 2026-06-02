import { requirePermission } from "@/lib/require-permission";

export const dynamic = "force-dynamic";

import ListTable from "@/components/users/ListTable";

export default async function Page() {
    await requirePermission("user");

    return <ListTable />;
}
