import { NextRequest, NextResponse } from "next/server";

// Host that serves the admin panel, e.g. "admin.example.com".
// Read at request time so it can be changed per deployment without rebuilding.
// When unset, host-based routing is disabled (admin stays reachable at /admin).
const ADMIN_HOST = process.env.ADMIN_HOST;

// Route segment under src/app that holds the admin routes (src/app/admin).
const segment = "/admin";

export function proxy(request: NextRequest) {
  // No admin host configured -> behave like a normal single-domain app.
  if (!ADMIN_HOST) return NextResponse.next();

  const host = (request.headers.get("host") ?? "").split(":")[0];
  const { pathname } = request.nextUrl;
  const isPrefixed = pathname === segment || pathname.startsWith(`${segment}/`);

  if (host === ADMIN_HOST) {
    // Admin domain: expose /<segment>/* under clean, prefix-free URLs.
    // Leave already-prefixed paths alone to avoid double prefixing.
    if (isPrefixed) return NextResponse.next();

    const url = request.nextUrl.clone();
    url.pathname = `${segment}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // Any other host: the admin section must not be reachable.
  if (isPrefixed) return new NextResponse(null, { status: 404 });

  return NextResponse.next();
}

export const config = {
  // Run on everything except API routes, Next internals and static files
  // (anything with a file extension, e.g. /logo.png).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
