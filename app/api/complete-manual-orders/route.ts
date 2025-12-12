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

    const results = [];

    // Complete orders for these domains
    const domainNames = ['possible.bet', 'whatever.bet'];

    for (const domainName of domainNames) {
        try {
            // Find the order by domain name
            const order = await db.order.findFirst({
                where: {
                    domain: { name: domainName },
                    status: { not: 'completed' },
                },
                include: { domain: true },
            });

            if (!order) {
                // Maybe already completed, check domain
                const domain = await db.domain.findFirst({ where: { name: domainName } });
                if (domain?.status === 'sold') {
                    results.push({ domain: domainName, status: 'already_done' });
                } else {
                    results.push({ domain: domainName, status: 'no_order_found' });
                }
                continue;
            }

            // Mark order as completed
            await db.order.update({
                where: { id: order.id },
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

            results.push({ domain: domainName, orderId: order.id, status: 'completed' });
        } catch (error: any) {
            results.push({ domain: domainName, status: 'error', message: error.message });
        }
    }

    // Verify consider.bet
    try {
        const domain = await db.domain.findFirst({
            where: { name: 'consider.bet' },
        });

        if (domain) {
            await db.domain.update({
                where: { id: domain.id },
                data: { isVerified: true },
            });
            results.push({ action: 'verify', domain: 'consider.bet', status: 'verified' });
        } else {
            results.push({ action: 'verify', domain: 'consider.bet', status: 'not_found' });
        }
    } catch (error: any) {
        results.push({ action: 'verify', domain: 'consider.bet', status: 'error', message: error.message });
    }

    return NextResponse.json({
        message: 'Manual operations completed',
        results,
    });
}
