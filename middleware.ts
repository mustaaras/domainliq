import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers.get('host') || '';

    // Get the subdomain
    const subdomain = hostname.split('.')[0];

    // If it's a subdomain (not www or the main domain)
    if (subdomain && subdomain !== 'www' && subdomain !== 'domainliq' && !hostname.includes('localhost')) {
        // Rewrite to the subdomain page
        url.pathname = `/p/${subdomain}`;
        return NextResponse.rewrite(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
