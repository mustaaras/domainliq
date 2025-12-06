import { NextRequest, NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const auth = NextAuth(authConfig).auth;

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers.get('host') || '';

    // Redirect www to non-www for custom domains
    if (hostname.startsWith('www.') && !hostname.includes('domainliq.com')) {
        const nonWwwHost = hostname.replace(/^www\./, '');
        return NextResponse.redirect(`https://${nonWwwHost}${url.pathname}${url.search}`, 301);
    }

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

        console.log(`[Middleware] Incoming Custom Domain: ${hostname}`);
        console.log(`[Middleware] Normalized Host: ${currentHost}`);

        // CHECK: Is this a subdomain of domainliq.com? (e.g. aras.domainliq.com)
        // ALSO ALLOW .localhost for local testing
        if (currentHost.endsWith('.domainliq.com') || currentHost.endsWith('.localhost')) {
            // Redirect /d/* to main domain (Domain Detail/Lander pages)
            if (url.pathname.startsWith('/d/')) {
                const mainDomain = hostname.includes('localhost') ? 'localhost:3000' : 'domainliq.com';
                return NextResponse.redirect(`${url.protocol}//${mainDomain}${url.pathname}`);
            }

            // Extract subdomain (e.g. "aras")
            const subdomain = currentHost.replace('.domainliq.com', '').replace('.localhost', '');
            console.log(`[Middleware] Subdomain detected: ${subdomain} -> Rewriting to /u/${subdomain}`);
            url.pathname = `/u/${subdomain}${url.pathname}`;
            return NextResponse.rewrite(url);
        }

        // Otherwise, it's a fully custom domain (e.g. possible.bet) -> Domain Lander
        console.log(`[Middleware] Custom Domain detected: ${currentHost}`);
        console.log(`[Middleware] Rewriting to: /d/${currentHost}${url.pathname}`);
        url.pathname = `/d/${currentHost}${url.pathname}`;

        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('x-is-custom-domain', 'true');

        return NextResponse.rewrite(url, {
            request: {
                headers: requestHeaders,
            },
        });
    }

    // For main domain, run normal auth middleware
    return (auth as any)(req);
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
