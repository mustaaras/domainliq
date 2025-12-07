import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const domainName = searchParams.get('domain');

    if (!domainName) {
        return new NextResponse('Domain parameter required', { status: 400 });
    }

    try {
        // Check if the domain exists in our database
        // We only want to issue SSL certificates for domains that are registered in our system.
        const domain = await db.domain.findFirst({
            where: {
                name: {
                    equals: domainName,
                    mode: 'insensitive'
                }
            },
            select: { id: true }
        });

        if (domain) {
            // 200 OK tells Caddy: "Yes, issue the certificate"
            return new NextResponse('Allowed', { status: 200 });
        } else {
            // 403 Forbidden tells Caddy: "No, do not issue"
            return new NextResponse('Domain not allowed', { status: 403 });
        }
    } catch (error) {
        console.error('Verify Domain API Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
