import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createTransferToSeller } from '@/lib/stripe';
import { Resend } from 'resend';

// Lazy initialization
let _resend: Resend | null = null;
function getResend(): Resend {
    if (!_resend) {
        _resend = new Resend(process.env.RESEND_API_KEY);
    }
    return _resend;
}

// This route should be called by a cron job service (e.g., Vercel Cron, GitHub Actions)
export async function GET(req: Request) {
    try {
        // Find all orders that are ready for auto-release
        const stuckOrders = await db.order.findMany({
            where: {
                status: 'transferred',
                autoReleaseAt: {
                    lte: new Date(), // Where date is in the past
                },
            },
            include: {
                seller: true,
                domain: true,
            },
        });

        if (stuckOrders.length === 0) {
            return NextResponse.json({ message: 'No orders to release' });
        }

        const results = [];

        for (const order of stuckOrders) {
            try {
                // Calculate payout
                const payoutAmount = order.amount - order.platformFee;
                let transferId = null;

                if (order.seller.stripeConnectedAccountId && payoutAmount > 0) {
                    transferId = await createTransferToSeller(
                        payoutAmount,
                        order.seller.stripeConnectedAccountId,
                        order.id
                    );
                }

                // Update DB
                await db.order.update({
                    where: { id: order.id },
                    data: {
                        status: 'completed',
                        completedAt: new Date(),
                        stripeTransferId: transferId,
                    },
                });

                await db.domain.update({
                    where: { id: order.domainId },
                    data: { status: 'sold' },
                });

                // Notify Seller
                await getResend().emails.send({
                    from: 'DomainLiq <info@domainliq.com>',
                    to: order.seller.email,
                    subject: `💰 Auto-Release: Payout sent for ${order.domain.name}`,
                    html: `
                        <h2>Funds Released Automatically</h2>
                        <p>The buyer did not confirm receipt within 7 days, so we have automatically released the funds to you.</p>
                        <p><strong>Domain:</strong> ${order.domain.name}</p>
                        <p><strong>Payout Amount:</strong> $${(payoutAmount / 100).toFixed(2)}</p>
                        <hr>
                        <p>The funds are now on their way to your bank account.</p>
                    `,
                });

                results.push({ orderId: order.id, status: 'released' });

            } catch (error: any) {
                console.error(`[Auto-Release] Failed for order ${order.id}:`, error);
                results.push({ orderId: order.id, status: 'failed', error: error.message });
            }
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            results,
        });

    } catch (error) {
        console.error('[Cron Auto-Release] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
