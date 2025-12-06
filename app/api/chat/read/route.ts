
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { domainId, visitorId } = body;

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
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // Mark all messages from seller as read
        await db.chatMessage.updateMany({
            where: {
                sessionId: session.id,
                sender: 'seller',
                read: false,
            },
            data: {
                read: true,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking messages read:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
