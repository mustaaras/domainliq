import { db } from '@/lib/db';
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sessionId } = await params;

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
        }

        // Verify ownership of the session via the domain
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

        // Delete the session (messages will be deleted via cascade if configured, otherwise we should delete them first)
        // Prisma usually handles cascade delete if defined in schema, but let's be safe and delete messages first if needed.
        // Assuming cascade delete is set up in schema for relation. If not, we might need to delete messages manually.
        // Let's check schema later if needed, but for now standard delete.

        await db.chatMessage.deleteMany({
            where: { sessionId: sessionId },
        });

        await db.chatSession.delete({
            where: { id: sessionId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting session:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
