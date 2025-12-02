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
        // Normalize hostname: remove 'www.' and port number if present
        const currentHost = hostname.replace(/^www\./, '').split(':')[0];

        // Rewrite the request to the domain landing page route
        // e.g., example.com/ -> /d/example.com/
        url.pathname = `/d/${currentHost}${url.pathname}`;
        return NextResponse.rewrite(url);
    }

    // For main domain, run normal auth middleware
    return (auth as any)(req);
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
