import { NextRequest, NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
    const url = req.nextUrl;
    const hostname = req.headers.get('host') || '';

    // Define main domains
    const mainDomains = ['localhost:3000', 'domainliq.com'];
    const isMainDomain = mainDomains.some(domain => hostname.includes(domain)) &&
        !hostname.startsWith('www.') &&
        (hostname.split('.').length === (hostname.includes('localhost') ? 1 : 2));

    // If it's a subdomain (e.g. user.domainliq.com)
    if (!isMainDomain && hostname.split('.').length > 2) {
        const subdomain = hostname.split('.')[0];
        // Rewrite to the public profile page
        return NextResponse.rewrite(new URL(`/p/${subdomain}${url.pathname}`, req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
