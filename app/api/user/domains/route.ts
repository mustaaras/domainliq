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

        const body = await req.json();

        // Get user ID
        const user = await db.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Handle Bulk Upload (Array)
        if (Array.isArray(body)) {
            const domains = body.map((item: any) => ({
                name: item.name,
                price: item.price,
                userId: user.id,
                status: 'available',
            }));

            if (domains.length === 0) {
                return NextResponse.json({ error: 'No domains provided' }, { status: 400 });
            }

            const result = await db.domain.createMany({
                data: domains,
                skipDuplicates: true, // Optional: skip if domain already exists (needs unique constraint on name)
            });

            return NextResponse.json({ count: result.count, message: `Successfully added ${result.count} domains` });
        }

        // Handle Single Upload (Object)
        const { name, price } = body;

        if (!name || !price) {
            return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
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
