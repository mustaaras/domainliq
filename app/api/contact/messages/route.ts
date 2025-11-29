import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const session = await auth();

        // Check if user is authenticated and is admin
        if (!session?.user?.email || session.user.email !== 'huldil@icloud.com') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const messages = await db.contactMessage.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Failed to fetch messages:', error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}
