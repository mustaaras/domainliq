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
            const buyerEmail = session.customer_details?.email;
            const amountFormatted = ((session.amount_total || 0) / 100).toFixed(2);

            // Email to seller
            await resend.emails.send({
                from: 'DomainLiq <noreply@domainliq.com>',
                to: seller.email,
                subject: `🎉 New Sale: ${domainName} for $${amountFormatted}`,
                html: `
                    <h2>Congratulations! You made a sale! 🎉</h2>
                    <p><strong>Domain:</strong> ${domainName}</p>
                    <p><strong>Amount:</strong> $${amountFormatted}</p>
                    <p>Please go to your <a href="https://domainliq.com/dashboard/orders">Orders Dashboard</a> to provide the authorization code.</p>
                    <p>You have 48 hours to complete the transfer.</p>
                `,
            });

            // Email to buyer
            if (buyerEmail) {
                await resend.emails.send({
                    from: 'DomainLiq <noreply@domainliq.com>',
                    to: buyerEmail,
                    subject: `✅ Order Confirmed: ${domainName}`,
                    html: `
                        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #10B981;">✅ Your order has been confirmed!</h2>
                            
                            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                                <p style="margin: 4px 0;"><strong>Domain:</strong> ${domainName}</p>
                                <p style="margin: 4px 0;"><strong>Amount Paid:</strong> $${amountFormatted}</p>
                            </div>
                            
                            <h3 style="color: #374151; margin-top: 24px;">📋 What happens next?</h3>
                            
                            <div style="background: #DBEAFE; border-left: 4px solid #3B82F6; padding: 12px 16px; margin: 16px 0;">
                                <strong>Step 1: Wait for the Auth Code</strong>
                                <p style="margin: 8px 0 0 0; color: #1E40AF;">The seller will unlock the domain and send us the Authorization Code. We'll email it to you as soon as we receive it.</p>
                            </div>
                            
                            <div style="background: #D1FAE5; border-left: 4px solid #10B981; padding: 12px 16px; margin: 16px 0;">
                                <strong>Step 2: Transfer the Domain</strong>
                                <p style="margin: 8px 0 0 0; color: #065F46;">Use the auth code to initiate a transfer at your preferred registrar (Namecheap, GoDaddy, Cloudflare, etc.).</p>
                            </div>
                            
                            <div style="background: #EDE9FE; border-left: 4px solid #8B5CF6; padding: 12px 16px; margin: 16px 0;">
                                <strong>Step 3: Confirm Receipt</strong>
                                <p style="margin: 8px 0 0 0; color: #5B21B6;">Once the transfer is complete, click the confirmation link in the email to release payment to the seller.</p>
                            </div>
                            
                            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
                            
                            <p style="color: #6B7280; font-size: 14px;">
                                <strong>🔒 Buyer Protection:</strong> Your funds are held securely until you confirm the domain transfer. If something goes wrong, contact us at support@domainliq.com.
                            </p>
                        </div>
                    `,
                });
            }
        } catch (emailError) {
            console.error('[Order Sync] Email failed:', emailError);
        }

        return NextResponse.json({ success: true, orderId: order.id, status: 'created' });

    } catch (error: any) {
        console.error('[Order Sync] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
