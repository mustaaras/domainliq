import { db } from '@/lib/db';
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const domain = await db.domain.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!domain) {
            return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
        }

        if (domain.user.email !== session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Check if user already has a token
        if (domain.user.verificationToken) {
            return NextResponse.json({ token: domain.user.verificationToken });
        }

        // Generate new token for the user
        const verificationToken = `user-${Math.random().toString(36).substring(2, 10)}`;

        await db.user.update({
            where: { id: domain.userId },
            data: { verificationToken }
        });

        return NextResponse.json({ token: verificationToken });

    } catch (error) {
        console.error('Token generation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
