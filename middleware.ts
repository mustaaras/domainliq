import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers.get('host') || '';

    console.log('🔍 Middleware - Hostname:', hostname);
    console.log('🔍 Middleware - Pathname:', url.pathname);

    // Check if this is a subdomain of domainliq.com
    const parts = hostname.split('.');
    console.log('🔍 Middleware - Parts:', parts);

    // If hostname has more than 2 parts and ends with domainliq.com, it's a subdomain
    if (parts.length >= 3 && hostname.includes('domainliq.com')) {
        const subdomain = parts[0];
        console.log('🔍 Middleware - Detected subdomain:', subdomain);

        // Exclude www
        if (subdomain !== 'www') {
            // Rewrite to the subdomain page
            const newPath = `/p/${subdomain}`;
            console.log('🔍 Middleware - Rewriting to:', newPath);
            url.pathname = newPath;
            return NextResponse.rewrite(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
