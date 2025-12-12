import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
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
                // Calculate payout amount (total - platform fee)
                const payoutAmount = order.amount - order.platformFee;
                let transferId = null;

                // Create transfer to seller using source_transaction
                if (order.seller.stripeConnectedAccountId && payoutAmount > 0 && order.stripePaymentIntentId) {
                    const Stripe = (await import('stripe')).default;
                    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

                    // Get the charge from the payment intent
                    const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
                    const chargeId = typeof paymentIntent.latest_charge === 'string'
                        ? paymentIntent.latest_charge
                        : paymentIntent.latest_charge?.id;

                    if (chargeId) {
                        const transfer = await stripe.transfers.create({
                            amount: payoutAmount,
                            currency: 'usd',
                            destination: order.seller.stripeConnectedAccountId,
                            source_transaction: chargeId,
                            metadata: {
                                orderId: order.id,
                                autoRelease: 'true',
                            },
                        });
                        transferId = transfer.id;
                    }
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
                    from: 'DomainLiq Orders <info@domainliq.com>',
                    to: order.seller.email,
                    subject: `Funds Auto-Released: ${order.domain.name}`,
                    html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <title>Funds Released</title>
                    </head>
                    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td align="center" style="padding: 40px 0;">
                                    <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                                        <!-- Header -->
                                        <tr>
                                            <td style="padding: 32px; background-color: #000000; text-align: center;">
                                                <img src="https://domainliq.com/icon-512.png" alt="DomainLiq" width="48" height="48" style="display: inline-block; vertical-align: middle;">
                                                <span style="color: #ffffff; font-size: 24px; font-weight: bold; vertical-align: middle; margin-left: 12px;">DomainLiq</span>
                                            </td>
                                        </tr>

                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 40px 32px;">
                                                <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin: 0 0 24px 0; text-align: center;">Funds Auto-Released 💸</h1>
                                                
                                                <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
                                                    Since 7 days have passed without a dispute, we've automatically released the funds for <strong>${order.domain.name}</strong> to your account.
                                                </p>

                                                <div style="background-color: #ECFDF5; border: 1px solid #6EE7B7; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                        <tr>
                                                            <td style="padding-bottom: 8px;">
                                                                <p style="margin: 0; color: #065F46; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Payout Amount</p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <p style="margin: 0; color: #059669; font-size: 32px; font-weight: bold;">$${(payoutAmount / 100).toFixed(2)}</p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding-top: 8px;">
                                                                 <p style="margin: 0; color: #065F46; font-size: 12px;">(After platform fees)</p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </div>

                                                <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 32px;">
                                                    The funds typically arrive in your connected Stripe bank account within <strong>1-2 business days</strong>.
                                                </p>
                                                
                                                <div style="text-align: center;">
                                                    <a href="https://domainliq.com/dashboard/orders" style="display: inline-block; background-color: #F59E0B; color: #ffffff; font-weight: bold; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2);">
                                                        View Order
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>

                                        <!-- Footer -->
                                        <tr>
                                            <td style="padding: 32px; background-color: #F3F4F6; text-align: center;">
                                                <p style="margin: 0 0 16px 0; color: #6B7280; font-size: 14px;">
                                                    Need help? Contact us at <a href="mailto:support@domainliq.com" style="color: #F59E0B; text-decoration: none;">support@domainliq.com</a>
                                                </p>
                                                <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                                                    &copy; ${new Date().getFullYear()} DomainLiq. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
            `
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
