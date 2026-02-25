import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();
    const hostname = req.headers.get('host') || '';

    // Define ignored hosts (main landing page)
    const mainDomains = ['localhost:3000', 'qqx-eight.vercel.app', 'qqx.de'];
    const isMainDomain = mainDomains.includes(hostname);

    // Extract subdomain
    const subdomain = hostname.split('.')[0];

    // If it's a subdomain and NOT the main domain
    if (!isMainDomain && subdomain && subdomain !== 'www') {
        // In a real production setup with wildcard domains, 
        // you would rewrite the URL to a dynamic segment like:
        // url.pathname = `/_tenants/${subdomain}${url.pathname}`;
        // For now, we just pass the subdomain as a header for our API client to pick up
        const response = NextResponse.next();
        response.headers.set('x-tenant-subdomain', subdomain);
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
