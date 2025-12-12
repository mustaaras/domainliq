import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// This endpoint ensures order is created even if webhook fails
// Called from success page as a safety net

export async function POST(req: NextRequest) {
    try {
        const { sessionId } = await req.json();

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        // Check if order already exists for this session
        const existingOrder = await db.order.findFirst({
            where: { stripeCheckoutSessionId: sessionId },
        });

        if (existingOrder) {
            console.log(`[Order Sync] Order already exists for session: ${sessionId}`);
            return NextResponse.json({ success: true, orderId: existingOrder.id, status: 'existing' });
        }

        // Fetch session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
        }

        const { domainId, domainName, sellerId, platformFee } = session.metadata || {};

        if (!domainId || !sellerId) {
            return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
        }

        // Get seller info
        const seller = await db.user.findUnique({
            where: { id: sellerId },
            select: { email: true, name: true },
        });

        if (!seller) {
            return NextResponse.json({ error: 'Seller not found' }, { status: 400 });
        }

        // Create order
        const order = await db.order.create({
            data: {
                domainId,
                sellerId,
                buyerEmail: session.customer_details?.email || 'unknown',
                buyerName: session.customer_details?.name || null,
                amount: session.amount_total || 0,
                platformFee: parseInt(platformFee || '0'),
                stripeCheckoutSessionId: session.id,
                stripePaymentIntentId: session.payment_intent as string,
                status: 'paid',
                paidAt: new Date(),
            },
        });

        console.log(`[Order Sync] Created order: ${order.id} for ${domainName}`);

        // Update domain status
        await db.domain.update({
            where: { id: domainId },
            data: { status: 'pending_transfer' },
        });

        // Send notification emails (best effort)
        try {
            const resend = new Resend(process.env.RESEND_API_KEY);

            await resend.emails.send({
                from: 'DomainLiq <noreply@domainliq.com>',
                to: seller.email,
                subject: `🎉 New Sale: ${domainName} for $${((session.amount_total || 0) / 100).toFixed(2)}`,
                html: `
                    <h2>Congratulations! You made a sale! 🎉</h2>
                    <p><strong>Domain:</strong> ${domainName}</p>
                    <p><strong>Amount:</strong> $${((session.amount_total || 0) / 100).toFixed(2)}</p>
                    <p>Please go to your <a href="https://domainliq.com/dashboard/orders">Orders Dashboard</a> to provide the authorization code.</p>
                    <p>You have 48 hours to complete the transfer.</p>
                `,
            });
        } catch (emailError) {
            console.error('[Order Sync] Email failed:', emailError);
        }

        return NextResponse.json({ success: true, orderId: order.id, status: 'created' });

    } catch (error: any) {
        console.error('[Order Sync] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
