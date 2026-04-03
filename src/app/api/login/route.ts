import { NextResponse } from "next/server";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export async function POST(req: Request) {
    const body = await req.text();

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
    });

    const data = await res.json();

    const nextRes = NextResponse.json(data, { status: res.status });

    const setCookieHeader = res.headers.get("set-cookie");
    if (setCookieHeader) {
        const cookiesArray = setCookieHeader.split(",");
        cookiesArray.forEach((cookieStr) => {
            const match = cookieStr.match(/(accessToken)=([^;]+);?/);
            if (match) {
                const [, name, value] = match;
                nextRes.cookies.set(name, value, {
                    // Must be readable by client route-guards / api-client.
                    httpOnly: false,
                    sameSite: "strict",
                    secure: process.env.NODE_ENV === "production",
                    path: "/",
                });
            }
        });
    }

    if (data.id) {
        const cookieOptions: Partial<ResponseCookie> = {
            // Used by client session helper.
            httpOnly: false,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            path: "/",
        };

        nextRes.cookies.set("userId", data.id.toString(), cookieOptions);
    }

    return nextRes;
}
