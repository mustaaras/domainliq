import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params;

        // Normalize username (it's the subdomain)
        const subdomain = username.toLowerCase();

        const user = await db.user.findUnique({
            where: { subdomain },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const portfolios = await db.portfolio.findMany({
            where: { userId: user.id },
            include: {
                domains: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        status: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Filter out empty portfolios if desired, or keep them. 
        // Assuming we show all created portfolios.

        return NextResponse.json(portfolios);
    } catch (error) {
        console.error('Error fetching public portfolios:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
