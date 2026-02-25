import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const hostname = request.headers.get("host") || "";
    const baseDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "qqx-app.de";

    // Detect subdomain
    let subdomain = "";
    if (hostname.includes(".") && !hostname.includes("localhost")) {
        const parts = hostname.split(".");
        if (parts.length > 2) {
            // e.g. tenant.qqx-app.de or tenant.vercel.app
            subdomain = parts[0];
        }
    }

    const response = NextResponse.next();

    // Set subdomain header if detected
    if (subdomain && subdomain !== "www") {
        response.headers.set("x-tenant-subdomain", subdomain);
    }

    // Add a debug header to confirm middleware is running
    response.headers.set("x-qqx-middleware", "active");

    return response;
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
