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

        const count = await db.chatMessage.count({
            where: {
                sender: 'visitor',
                read: false,
                session: {
                    OR: [
                        { userId: user.id },
                        {
                            domain: {
                                userId: user.id,
                            },
                        },
                    ],
                },
            },
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
