
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');

    if (!domain) {
        return new NextResponse('Domain required', { status: 400 });
    }

    // Allow internal domains / health checks
    if (domain === 'localhost' || domain.endsWith('.localhost') || domain.endsWith('.domainliq.com') || domain === 'domainliq.com') {
        return new NextResponse('Allowed', { status: 200 });
    }

    try {
        // Check if domain exists in our database
        // We only issue certs for domains that are actually in our system
        const exists = await db.domain.findFirst({
            where: {
                name: domain,
            },
            select: { id: true }
        });

        if (exists) {
            return new NextResponse('Allowed', { status: 200 });
        }

        return new NextResponse('Denied', { status: 403 });
    } catch (error) {
        console.error('[Domain Verify] Error verifying domain:', error);
        return new NextResponse('Error', { status: 500 });
    }
}
