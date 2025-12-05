import { db } from '@/lib/db';
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ messageId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messageId } = await params;

        if (!messageId) {
            return NextResponse.json({ error: 'Missing messageId' }, { status: 400 });
        }

        // Verify ownership of the message via the session and domain
        const message = await db.chatMessage.findUnique({
            where: { id: messageId },
            include: {
                session: {
                    include: {
                        domain: true,
                    },
                },
            },
        });

        if (!message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isOwner = message.session.userId === user.id;
        const isDomainOwner = message.session.domain?.userId === user.id;

        if (!isOwner && !isDomainOwner) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Delete the message
        await db.chatMessage.delete({
            where: { id: messageId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting message:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
