import { db } from '@/lib/db';
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update lastSeen
        await db.user.update({
            where: { id: user.id },
            data: { lastSeen: new Date() },
        });

        // Fetch sessions for all domains owned by the user
        const sessions = await db.chatSession.findMany({
            where: {
                domain: {
                    userId: user.id,
                },
            },
            include: {
                domain: {
                    select: {
                        name: true,
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                sender: 'visitor',
                                read: false,
                            },
                        },
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        // Format response
        const formattedSessions = sessions.map(session => ({
            id: session.id,
            domainName: session.domain.name,
            visitorName: session.visitorName || 'Visitor',
            visitorEmail: session.visitorEmail,
            lastMessage: session.messages[0]?.content || '',
            lastMessageAt: session.updatedAt,
            unreadCount: session._count.messages,
        }));

        return NextResponse.json({ sessions: formattedSessions });
    } catch (error) {
        console.error('Error fetching chat sessions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
