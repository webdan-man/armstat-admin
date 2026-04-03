import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const id = cookieStore.get("userId")?.value ?? null;
    const permissions = cookieStore.get("userPermissions")?.value ?? null;

    return NextResponse.json({ id, permissions });
}
