import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/api/webhooks(.*)"]);

export default clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
        await auth.protect();
    }

    // Tenant/Subdomain logic
    const hostname = request.headers.get("host") || "";
    const currentPath = request.nextUrl.pathname;

    // Exclude local dev and base domains perfectly (add your real prod domain here)
    const isLocalHost = hostname.includes("localhost");
    const baseDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "driverflow.app";

    let subdomain = "";
    if (!isLocalHost) {
        if (hostname.endsWith(`.${baseDomain}`)) {
            subdomain = hostname.replace(`.${baseDomain}`, "");
        }
    } else {
        // For local dev, mimic subdomain via a custom header or query param if needed
        // e.g. "kunde1.localhost:3000"
        if (hostname.split('.').length > 1 && hostname.split('.')[1].startsWith('localhost')) {
            subdomain = hostname.split('.')[0];
        }
    }

    // Forward subdomain as a custom header so the backend server actions know the tenant context
    const requestHeaders = new Headers(request.headers);
    if (subdomain && subdomain !== "www") {
        requestHeaders.set("x-tenant-subdomain", subdomain);

        // Potential Route rewriting to tenant-specific pages (e.g. /app/[tenant])
        // if (currentPath === "/") {
        //   return NextResponse.rewrite(new URL(`/app/${subdomain}`, request.url));
        // }
    }

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        }
    });
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
