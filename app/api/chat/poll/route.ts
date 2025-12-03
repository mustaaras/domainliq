import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const domainId = searchParams.get('domainId');
        const visitorId = searchParams.get('visitorId');
        const after = searchParams.get('after'); // Timestamp to fetch messages after

        if (!domainId || !visitorId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const session = await db.chatSession.findFirst({
            where: {
                domainId,
                visitorId,
            },
        });

        if (!session) {
            return NextResponse.json({ messages: [] });
        }

        const where: any = {
            sessionId: session.id,
        };

        if (after) {
            where.createdAt = {
                gt: new Date(after),
            };
        }

        const messages = await db.chatMessage.findMany({
            where,
            orderBy: {
                createdAt: 'asc',
            },
        });

        // Get seller's last seen
        const domain = await db.domain.findUnique({
            where: { id: domainId },
            include: { user: { select: { lastSeen: true } } },
        });

        return NextResponse.json({
            messages,
            sellerLastSeen: domain?.user?.lastSeen,
        });
    } catch (error) {
        console.error('Error polling messages:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
