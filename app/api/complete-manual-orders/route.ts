import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// ONE-TIME SCRIPT: Delete this file after running!
// Visit: https://domainliq.com/api/complete-manual-orders?secret=domainliq2024

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== 'domainliq2024') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orderIds = [
        'cmj34mxiz0002emzlc0kfm8is', // possible.bet
        'cmj34mxja0006emzldmnjt3gw', // whatever.bet
    ];

    const results = [];

    for (const orderId of orderIds) {
        try {
            const order = await db.order.findUnique({
                where: { id: orderId },
                include: { domain: true },
            });

            if (!order) {
                results.push({ orderId, status: 'error', message: 'Order not found' });
                continue;
            }

            if (order.status === 'completed') {
                results.push({ orderId, domain: order.domain.name, status: 'skipped', message: 'Already completed' });
                continue;
            }

            // Mark order as completed
            await db.order.update({
                where: { id: orderId },
                data: {
                    status: 'completed',
                    completedAt: new Date(),
                    stripeTransferId: 'manual_payout_already_received',
                },
            });

            // Mark domain as sold
            await db.domain.update({
                where: { id: order.domainId },
                data: { status: 'sold' },
            });

            results.push({ orderId, domain: order.domain.name, status: 'completed' });
        } catch (error: any) {
            results.push({ orderId, status: 'error', message: error.message });
        }
    }

    return NextResponse.json({
        message: 'Manual orders completed',
        results,
    });
}
