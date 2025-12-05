import { db } from '@/lib/db';
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('sessionId');
        const after = searchParams.get('after');

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
        }

        // Verify ownership of the session
        const chatSession = await db.chatSession.findUnique({
            where: { id: sessionId },
            include: {
                domain: true,
            },
        });

        if (!chatSession) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isOwner = chatSession.userId === user.id;
        const isDomainOwner = chatSession.domain?.userId === user.id;

        if (!isOwner && !isDomainOwner) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const where: any = {
            sessionId,
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

        // Mark as read if requested
        if (searchParams.get('markRead') === 'true') {
            await db.chatMessage.updateMany({
                where: {
                    sessionId,
                    sender: 'visitor',
                    read: false,
                    ...(after ? { createdAt: { gt: new Date(after) } } : {}),
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
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sessionId, content } = await req.json();

        if (!sessionId || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify ownership
        const chatSession = await db.chatSession.findUnique({
            where: { id: sessionId },
            include: {
                domain: true,
            },
        });

        if (!chatSession) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isOwner = chatSession.userId === user.id;
        const isDomainOwner = chatSession.domain?.userId === user.id;

        if (!isOwner && !isDomainOwner) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Create message
        const message = await db.chatMessage.create({
            data: {
                sessionId,
                sender: 'seller',
                content,
                read: true, // Seller messages are read by default (by seller)
            },
        });

        // Update session updated at
        await db.chatSession.update({
            where: { id: sessionId },
            data: { updatedAt: new Date() },
        });

        return NextResponse.json({ message });
    } catch (error) {
        console.error('Error sending reply:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
