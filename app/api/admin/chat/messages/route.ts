
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (session?.user?.email !== 'huldil@icloud.com') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('sessionId');
        const markRead = searchParams.get('markRead') === 'true';
        const after = searchParams.get('after');

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        const where: any = { sessionId };
        if (after) {
            where.createdAt = { gt: new Date(after) };
        }

        // Fetch messages
        const messages = await db.chatMessage.findMany({
            where,
            orderBy: { createdAt: 'asc' },
        });

        // Mark messages as read if requested (messages from 'seller' i.e. User)
        if (markRead && messages.length > 0) {
            await db.chatMessage.updateMany({
                where: {
                    sessionId,
                    sender: 'seller',
                    read: false,
                },
                data: { read: true },
            });
        }

        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (session?.user?.email !== 'huldil@icloud.com') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sessionId, content } = await req.json();

        if (!sessionId || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create message
        const message = await db.chatMessage.create({
            data: {
                sessionId,
                sender: 'visitor', // Admin is 'visitor'
                content,
                read: false,
            },
        });

        // Update session timestamp
        await db.chatSession.update({
            where: { id: sessionId },
            data: { updatedAt: new Date() },
        });

        return NextResponse.json({ message });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
