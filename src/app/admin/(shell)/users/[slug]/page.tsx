import EditForm from "@/components/users/EditForm";
import { requirePermission } from "@/lib/require-permission";

async function EditCategoriesPage({ params }: { params: Promise<{ slug: string }> }) {
    await requirePermission("user");

    const { slug } = await params;

    return <EditForm id={slug} />;
}

export default EditCategoriesPage;
