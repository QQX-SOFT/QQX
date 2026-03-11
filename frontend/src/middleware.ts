import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();
    const hostname = req.headers.get('host') || '';
    const pathname = url.pathname;

    // Define ignored hosts (main landing page)
    const mainDomains = ['localhost:3000', 'qqx-eight.vercel.app', 'qqx.de', 'qqxsoft.com', 'www.qqxsoft.com'];
    const isMainDomain = mainDomains.includes(hostname);

    // Block /admin on main domain
    if (isMainDomain && pathname.startsWith('/admin')) {
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    // Extract subdomain
    const subdomain = hostname.split('.')[0];

    // If it's a subdomain and NOT the main domain
    if (!isMainDomain && subdomain && subdomain !== 'www') {
        const role = req.cookies.get('role')?.value;
        const tenantSubdomain = req.cookies.get('tenant-subdomain')?.value;

        // If at the root of a subdomain, redirect based on login status and role
        if (pathname === '/') {
            if (!role) {
                // Not logged in, go to login
                url.pathname = '/login';
                return NextResponse.redirect(url);
            }

            // Logged in, redirect to correct portal
            if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'CUSTOMER_ADMIN') {
                url.pathname = '/admin';
            } else if (role === 'DRIVER') {
                url.pathname = '/driver';
            } else if (role === 'CUSTOMER') {
                url.pathname = '/customer';
            } else {
                url.pathname = '/login';
            }
            return NextResponse.redirect(url);
        }

        const response = NextResponse.next();
        response.headers.set('x-tenant-subdomain', subdomain);
        return response;
    }

    // Special handling for superadmin on main domain
    if (isMainDomain && pathname.startsWith('/superadmin')) {
        const role = req.cookies.get('role')?.value;
        if (!role || role !== 'SUPER_ADMIN') {
            if (pathname !== '/superadmin/login') {
                url.pathname = '/superadmin/login';
                return NextResponse.redirect(url);
            }
        }
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
