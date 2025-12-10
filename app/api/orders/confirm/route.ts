import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stripe, createTransferToSeller } from '@/lib/stripe';
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
        const body = await req.json();
        const { token } = body;

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

        // Create transfer to seller
        let transferId = null;
        if (order.seller.stripeConnectedAccountId && payoutAmount > 0) {
            try {
                transferId = await createTransferToSeller(
                    payoutAmount,
                    order.seller.stripeConnectedAccountId,
                    order.id
                );
            } catch (transferError) {
                console.error('[Order Confirm] Transfer failed:', transferError);
                return NextResponse.json(
                    { error: 'Failed to process payout. Please contact support.' },
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
                from: 'DomainLiq <noreply@domainliq.com>',
                to: order.seller.email,
                subject: `💰 Payout sent: $${(payoutAmount / 100).toFixed(2)} for ${order.domain.name}`,
                html: `
                    <h2>Your payout has been sent!</h2>
                    <p><strong>Domain:</strong> ${order.domain.name}</p>
                    <p><strong>Sale Amount:</strong> $${(order.amount / 100).toFixed(2)}</p>
                    <p><strong>Platform Fee:</strong> $${(order.platformFee / 100).toFixed(2)}</p>
                    <p><strong>Your Payout:</strong> $${(payoutAmount / 100).toFixed(2)}</p>
                    <hr>
                    <p>The funds will be available in your Stripe account within 2-3 business days.</p>
                    <p>Thank you for selling on DomainLiq! 🎉</p>
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
