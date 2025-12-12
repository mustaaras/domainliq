import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json(
            { error: 'Missing token' },
            { status: 400 }
        );
    }

    try {
        const order = await db.order.findFirst({
            where: { buyerConfirmationToken: token },
            include: {
                domain: {
                    select: { name: true }
                }
            },
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found or invalid token' },
                { status: 404 }
            );
        }

        // Only allow access if status is transferred or completed
        if (!['transferred', 'completed'].includes(order.status)) {
            return NextResponse.json(
                { error: 'This order is not ready for pickup yet. Please wait for the seller to initiate the transfer.' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            id: order.id,
            domainName: order.domain.name,
            authCode: order.authCode,
            status: order.status,
            amount: order.amount,
        });

    } catch (error) {
        console.error('[Orders Reveal] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}
