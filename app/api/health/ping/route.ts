import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { domainName, subdomain } = await req.json();

        if (!domainName && !subdomain) {
            return NextResponse.json({ error: 'Target is required' }, { status: 400 });
        }

        if (domainName) {
            const domain = await db.domain.findFirst({ where: { name: domainName } });
            if (domain) {
                await db.$transaction([
                    db.domain.update({
                        where: { id: domain.id },
                        data: { views: { increment: 1 } }
                    }),
                    db.domainView.create({
                        data: { domainId: domain.id }
                    })
                ]);
            }
        }

        if (subdomain) {
            const user = await db.user.findUnique({ where: { subdomain } });
            if (user) {
                await db.$transaction([
                    db.user.update({
                        where: { id: user.id },
                        data: { profileViews: { increment: 1 } }
                    }),
                    db.profileView.create({
                        data: { userId: user.id }
                    })
                ]);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error tracking view:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
