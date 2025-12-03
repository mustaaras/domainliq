import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { domainId, content, visitorId, visitorName, visitorEmail } = await req.json();

        if (!domainId || !content || !visitorId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Find or create session
        let session = await db.chatSession.findFirst({
            where: {
                domainId,
                visitorId,
            },
        });

        if (!session) {
            session = await db.chatSession.create({
                data: {
                    domainId,
                    visitorId,
                    visitorName,
                    visitorEmail,
                },
            });
        } else {
            // Update visitor info if provided
            if (visitorName || visitorEmail) {
                await db.chatSession.update({
                    where: { id: session.id },
                    data: {
                        visitorName: visitorName || session.visitorName,
                        visitorEmail: visitorEmail || session.visitorEmail,
                    },
                });
            }
        }

        // Create message
        const message = await db.chatMessage.create({
            data: {
                sessionId: session.id,
                sender: 'visitor',
                content,
            },
        });

        // Update session updated at
        await db.chatSession.update({
            where: { id: session.id },
            data: { updatedAt: new Date() },
        });

        return NextResponse.json({ message, session });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
