import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
let _resend: Resend | null = null;
function getResend(): Resend {
    if (!_resend) {
        _resend = new Resend(process.env.RESEND_API_KEY);
    }
    return _resend;
}

export async function POST(req: Request) {
    try {
        // Get token from query string or body
        const url = new URL(req.url);
        let token = url.searchParams.get('token');

        if (!token) {
            try {
                const body = await req.json();
                token = body.token;
            } catch {
                // No body, that's fine
            }
        }

        if (!token) {
            return NextResponse.json({ error: 'Confirmation token required' }, { status: 400 });
        }

        // Find order by confirmation token
        const order = await db.order.findUnique({
            where: { buyerConfirmationToken: token },
            include: {
                domain: true,
                seller: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        stripeConnectedAccountId: true,
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json({ error: 'Invalid confirmation token' }, { status: 404 });
        }

        if (order.status === 'completed') {
            return NextResponse.json({ error: 'Order already completed' }, { status: 400 });
        }

        if (order.status !== 'transferred') {
            return NextResponse.json({ error: 'Domain has not been marked as transferred yet' }, { status: 400 });
        }

        // Calculate payout amount (total - platform fee)
        const payoutAmount = order.amount - order.platformFee;

        // Create transfer to seller using source_transaction
        // This links the transfer to the original charge, fixing "insufficient funds" error
        let transferId = null;
        if (order.seller.stripeConnectedAccountId && payoutAmount > 0 && order.stripePaymentIntentId) {
            try {
                const Stripe = (await import('stripe')).default;
                const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

                // Get the charge from the payment intent
                const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
                const chargeId = typeof paymentIntent.latest_charge === 'string'
                    ? paymentIntent.latest_charge
                    : paymentIntent.latest_charge?.id;

                if (!chargeId) {
                    throw new Error('Could not find charge for payment');
                }

                // Get the charge and expand balance_transaction to see settlement currency
                const charge = await stripe.charges.retrieve(chargeId, {
                    expand: ['balance_transaction'],
                });

                let transferCurrency = charge.currency;
                let transferAmount = payoutAmount;

                // Handle currency conversion (e.g., Charge in USD -> Settled in AUD)
                // Also handle same-currency but need to respect Stripe fee deductions
                if (charge.balance_transaction && typeof charge.balance_transaction !== 'string') {
                    const bt = charge.balance_transaction;

                    // Always use the NET settlement amount (after Stripe processing fees)
                    // This is the maximum we can transfer from this charge
                    const netSettlementAmount = bt.amount; // What's actually available

                    if (bt.currency !== charge.currency) {
                        // Currency conversion case (e.g., USD charge -> AUD settlement)
                        console.log(`[Order Confirm] Currency mismatch. Charge: ${charge.currency}, Settlement: ${bt.currency}`);
                        transferCurrency = bt.currency;

                        // Calculate seller's proportional share of the NET settlement
                        const ratio = payoutAmount / charge.amount;
                        transferAmount = Math.floor(netSettlementAmount * ratio);

                        console.log(`[Order Confirm] Converted: ${transferAmount} ${transferCurrency} (ratio: ${ratio.toFixed(4)}, net available: ${netSettlementAmount})`);
                    } else {
                        // Same currency - just ensure we don't exceed what's available
                        // transferAmount is already set to payoutAmount, but cap it
                        if (transferAmount > netSettlementAmount) {
                            console.log(`[Order Confirm] Capping transfer from ${transferAmount} to ${netSettlementAmount} (net available)`);
                            transferAmount = netSettlementAmount;
                        }
                    }
                }

                console.log(`[Order Confirm] Transferring ${transferAmount} ${transferCurrency} using source ${chargeId}`);

                // Create transfer linked to the original charge
                const transfer = await stripe.transfers.create({
                    amount: transferAmount,
                    currency: transferCurrency,
                    destination: order.seller.stripeConnectedAccountId,
                    source_transaction: chargeId,
                    metadata: {
                        orderId: order.id,
                        originalAmount: payoutAmount, // Keep track of original USD amount intended
                        originalCurrency: 'usd'
                    },
                });
                transferId = transfer.id;
            } catch (transferError: any) {
                console.error('[Order Confirm] Transfer failed:', transferError);
                return NextResponse.json(
                    { error: `Payout Failed: ${transferError.message || 'Unknown Stripe Error'}` },
                    { status: 500 }
                );
            }
        }

        // Update order status
        const updatedOrder = await db.order.update({
            where: { id: order.id },
            data: {
                status: 'completed',
                completedAt: new Date(),
                stripeTransferId: transferId,
            },
        });

        // Update domain status to sold
        await db.domain.update({
            where: { id: order.domainId },
            data: { status: 'sold' },
        });

        // Send payout confirmation to seller
        try {
            await getResend().emails.send({
                from: 'DomainLiq Orders <info@domainliq.com>',
                to: order.seller.email,
                subject: `Payout Sent! Your funds are on the way 💸`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <title>Payout Sent</title>
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
                                                <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin: 0 0 24px 0; text-align: center;">Funds Released! 💸</h1>
                                                
                                                <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
                                                    Great news! The buyer has confirmed the transfer of <strong>${order.domain.name}</strong>, and your funds have been released.
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
                                                    The funds typically arrive in your connected Stripe bank account within <strong>1-2 business days</strong> (depending on your bank).
                                                </p>
                                                
                                                <div style="text-align: center;">
                                                    <a href="https://domainliq.com/dashboard/orders" style="display: inline-block; background-color: #F59E0B; color: #ffffff; font-weight: bold; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2);">
                                                        View Details
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
                `,
            });
        } catch (emailError) {
            console.error('[Order Confirm] Failed to send payout email:', emailError);
        }

        return NextResponse.json({
            success: true,
            message: 'Order completed! Payout has been sent to the seller.',
        });

    } catch (error) {
        console.error('[Order Confirm] Error:', error);
        return NextResponse.json(
            { error: 'Failed to confirm order' },
            { status: 500 }
        );
    }
}
