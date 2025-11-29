import { db } from '@/lib/db';
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const domains = await db.domain.findMany({
            where: { user: { email: session.user.email } },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(domains);
    } catch (error) {
        console.error('User domains fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, price } = await req.json();

        if (!name || !price) {
            return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
        }

        // Get user ID
        const user = await db.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const domain = await db.domain.create({
            data: {
                name,
                price,
                userId: user.id,
                status: 'available',
            },
        });

        return NextResponse.json(domain);
    } catch (error) {
        console.error('Add domain error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
