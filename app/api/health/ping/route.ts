import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { domainName, subdomain } = await req.json();

        if (!domainName && !subdomain) {
            return NextResponse.json({ error: 'Target is required' }, { status: 400 });
        }

        if (domainName) {
            await db.domain.updateMany({
                where: { name: domainName },
                data: { views: { increment: 1 } }
            });
        }

        if (subdomain) {
            await db.user.update({
                where: { subdomain },
                data: { profileViews: { increment: 1 } }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error tracking view:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
