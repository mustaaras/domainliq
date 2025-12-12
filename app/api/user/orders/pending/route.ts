import { db } from '@/lib/db';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

// Get count of orders requiring seller action (paid, awaiting transfer)
export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ count: 0 });
    }

    try {
        const count = await db.order.count({
            where: {
                sellerId: session.user.id,
                status: 'paid', // Orders waiting for seller to provide auth code
            },
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('[Pending Orders] Error:', error);
        return NextResponse.json({ count: 0 });
    }
}
