import { NextRequest, NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const auth = NextAuth(authConfig).auth;

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers.get('host') || '';

    // Define main domains that should NOT be rewritten
    // Adjust these based on your actual production domains
    const isMainDomain =
        hostname === 'localhost:3000' ||
        hostname === 'domainliq.com' ||
        hostname === 'www.domainliq.com' ||
        hostname.endsWith('.vercel.app'); // Allow Vercel preview URLs

    // If it's a custom domain (e.g., "example.com" pointing to our server)
    if (!isMainDomain) {
        // Rewrite the request to the domain landing page route
        // e.g., example.com/ -> /d/example.com/
        // e.g., example.com/about -> /d/example.com/about
        url.pathname = `/d/${hostname}${url.pathname}`;
        return NextResponse.rewrite(url);
    }

    // For main domain, run normal auth middleware
    return (auth as any)(req);
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
