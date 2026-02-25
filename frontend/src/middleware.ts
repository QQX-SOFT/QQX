import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
        await auth.protect();
    }

    const hostname = request.headers.get("host") || "";
    const isLocalHost = hostname.includes("localhost");
    const baseDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "qqx-app.de";

    let subdomain = "";
    if (!isLocalHost) {
        if (hostname.endsWith(`.${baseDomain}`)) {
            subdomain = hostname.replace(`.${baseDomain}`, "");
        }
    } else {
        // Local dev: handle subdomain.localhost:3000
        const parts = hostname.split('.');
        if (parts.length > 1 && parts[parts.length - 1].split(':')[0] === 'localhost') {
            subdomain = parts[0];
        }
    }

    const response = NextResponse.next();
    if (subdomain && subdomain !== "www") {
        response.headers.set("x-tenant-subdomain", subdomain);
    }

    return response;
});

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
