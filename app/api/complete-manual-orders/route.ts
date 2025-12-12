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

    // Orders to create/complete
    const ordersToProcess = [
        { domain: 'possible.bet', buyerEmail: 'stanley@watterson.ca', amount: 800, paymentIntent: 'pm_1SdOC6FasmoHOTtlhuWzLFQL' },
        { domain: 'whatever.bet', buyerEmail: 'stanley@watterson.ca', amount: 1500, paymentIntent: 'pm_1SdODtFasmoHOTtltPssoIkS' },
        { domain: 'consider.bet', buyerEmail: 'stanley@watterson.ca', amount: 1000, paymentIntent: 'pi_3SddtAFasmoHOTtl0e2VVI5s' },
    ];

    for (const orderData of ordersToProcess) {
        try {
            // Find the domain
            const domain = await db.domain.findFirst({
                where: { name: orderData.domain },
            });

            if (!domain) {
                results.push({ domain: orderData.domain, status: 'domain_not_found' });
                continue;
            }

            // Check if order exists
            let order = await db.order.findFirst({
                where: { domainId: domain.id },
            });

            if (!order) {
                // Create the order
                order = await db.order.create({
                    data: {
                        domainId: domain.id,
                        sellerId: domain.userId,
                        buyerEmail: orderData.buyerEmail,
                        amount: orderData.amount,
                        platformFee: orderData.amount < 1000 ? 0 : 100,
                        stripePaymentIntentId: orderData.paymentIntent,
                        status: 'paid',
                        paidAt: new Date(),
                    },
                });
                results.push({ domain: orderData.domain, orderId: order.id, status: 'order_created' });
            } else if (order.status === 'completed') {
                results.push({ domain: orderData.domain, orderId: order.id, status: 'already_completed' });
            } else {
                // Complete existing order
                await db.order.update({
                    where: { id: order.id },
                    data: {
                        status: 'completed',
                        completedAt: new Date(),
                        stripeTransferId: 'manual_completed',
                    },
                });
                await db.domain.update({
                    where: { id: domain.id },
                    data: { status: 'sold' },
                });
                results.push({ domain: orderData.domain, orderId: order.id, status: 'completed' });
            }
        } catch (error: any) {
            results.push({ domain: orderData.domain, status: 'error', message: error.message });
        }
    }

    // Verify consider.bet
    try {
        const domain = await db.domain.findFirst({
            where: { name: 'consider.bet' },
        });

        if (domain && !domain.isVerified) {
            await db.domain.update({
                where: { id: domain.id },
                data: { isVerified: true },
            });
            results.push({ action: 'verify', domain: 'consider.bet', status: 'verified' });
        }
    } catch (error: any) {
        results.push({ action: 'verify', domain: 'consider.bet', status: 'error', message: error.message });
    }

    return NextResponse.json({
        message: 'Manual operations completed',
        results,
    });
}
