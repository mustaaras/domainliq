import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { addCustomDomainToCoolify } from '@/lib/coolify';

// Support both GET and POST for convenience
export async function GET() {
    return syncDomains();
}

export async function POST() {
    return syncDomains();
}

async function syncDomains() {
    try {
        const session = await auth();
        // Basic admin check (revise if you have specific admin roles)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const verifiedDomains = await db.domain.findMany({
            where: { isVerified: true },
            select: { name: true }
        });

        const results: { domain: string; success: boolean; error?: string }[] = [];

        for (const domain of verifiedDomains) {
            console.log(`Syncing ${domain.name} to Coolify...`);
            const res = await addCustomDomainToCoolify(domain.name);
            results.push({ domain: domain.name, ...res });
        }

        return NextResponse.json({
            message: 'Sync complete',
            total: verifiedDomains.length,
            results
        });

    } catch (error) {
        console.error('Sync error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
