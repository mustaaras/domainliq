import { db } from '@/lib/db';
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email },
            select: {
                name: true,
                email: true,
                subdomain: true,
                contactEmail: true,
                twitterHandle: true,
                whatsappNumber: true,
                linkedinProfile: true,
                preferredContact: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Settings fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();

        // Validate allowed fields
        const {
            name,
            contactEmail,
            twitterHandle,
            whatsappNumber,
            linkedinProfile,
            preferredContact
        } = data;

        const updatedUser = await db.user.update({
            where: { email: session.user.email },
            data: {
                name,
                contactEmail,
                twitterHandle,
                whatsappNumber,
                linkedinProfile,
                preferredContact,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Settings update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
