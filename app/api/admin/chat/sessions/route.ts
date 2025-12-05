
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (session?.user?.email !== 'huldil@icloud.com') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch sessions where visitorId is 'ADMIN'
        const sessions = await db.chatSession.findMany({
            where: {
                visitorId: 'ADMIN',
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        subdomain: true,
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
                                sender: 'seller', // User messages are 'seller'
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
            userName: session.user?.name || 'User',
            userEmail: session.user?.email,
            userSubdomain: session.user?.subdomain,
            lastMessage: session.messages[0]?.content || '',
            lastMessageAt: session.updatedAt,
            unreadCount: session._count.messages,
        }));

        return NextResponse.json({ sessions: formattedSessions });
    } catch (error) {
        console.error('Error fetching admin sessions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
