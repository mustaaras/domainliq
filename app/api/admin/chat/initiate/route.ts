
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        // Check if user is admin (simple check for now matching frontend)
        if (session?.user?.email !== 'huldil@icloud.com') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Find the user by email
        const targetUser = await db.user.findUnique({
            where: { email },
        });

        if (!targetUser) {
            return NextResponse.json({ error: 'User not registered with this email' }, { status: 404 });
        }

        // Check for existing Admin session
        const existingSession = await db.chatSession.findFirst({
            where: {
                userId: targetUser.id,
                visitorId: 'ADMIN',
                domainId: null,
            },
        });

        if (existingSession) {
            return NextResponse.json({ sessionId: existingSession.id });
        }

        // Create new session
        const newSession = await db.chatSession.create({
            data: {
                userId: targetUser.id,
                visitorId: 'ADMIN',
                visitorName: 'DomainLiq Support',
                visitorEmail: 'support@domainliq.com',
                domainId: null,
            },
        });

        return NextResponse.json({ sessionId: newSession.id });

    } catch (error) {
        console.error('Initiate chat error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
