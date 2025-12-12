import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, createTransferToSeller } from '@/lib/stripe';
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
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error('[Stripe Webhook] Signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`[Stripe Webhook] Event: ${event.type}`);

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            await handleCheckoutCompleted(session);
            break;
        }

        // Handle Connect account updates
        case 'account.updated': {
            const account = event.data.object;
            await handleAccountUpdated(account);
            break;
        }
    }

    return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: any) {
    const { domainId, domainName, sellerId, platformFee } = session.metadata || {};

    if (!domainId || !sellerId) {
        console.error('[Stripe Webhook] Missing metadata in checkout session');
        return;
    }

    // Get seller info
    const seller = await db.user.findUnique({
        where: { id: sellerId },
        select: { email: true, name: true },
    });

    if (!seller) {
        console.error('[Stripe Webhook] Seller not found:', sellerId);
        return;
    }

    // Create order
    const order = await db.order.create({
        data: {
            domainId,
            sellerId,
            buyerEmail: session.customer_email || session.customer_details?.email || 'unknown',
            buyerName: session.customer_details?.name || null,
            amount: session.amount_total || 0,
            platformFee: parseInt(platformFee) || 0,
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: session.payment_intent,
            status: 'paid',
            paidAt: new Date(),
        },
    });

    console.log(`[Stripe Webhook] Order created: ${order.id}`);

    // Update domain status
    await db.domain.update({
        where: { id: domainId },
        data: { status: 'pending_transfer' },
    });

    // Send email to seller
    try {
        await getResend().emails.send({
            from: 'DomainLiq <info@domainliq.com>',
            to: seller.email,
            subject: `🎉 New Sale: ${domainName} for $${(session.amount_total / 100).toFixed(2)}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #10B981;">🎉 Congratulations! You made a sale!</h2>
                    
                    <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                        <p style="margin: 4px 0;"><strong>Domain:</strong> ${domainName}</p>
                        <p style="margin: 4px 0;"><strong>Sale Price:</strong> $${(session.amount_total / 100).toFixed(2)}</p>
                        <p style="margin: 4px 0;"><strong>Buyer:</strong> ${session.customer_details?.name ? session.customer_details.name.substring(0, 2) + '***' : 'Anonymous'} ${session.customer_details?.address?.country ? `(${session.customer_details.address.country})` : ''}</p>
                    </div>
                    
                    <h3 style="color: #374151; margin-top: 24px;">📋 How to Complete the Transfer:</h3>
                    
                    <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px 16px; margin: 16px 0;">
                        <strong>Step 1: Unlock Your Domain</strong>
                        <p style="margin: 8px 0 0 0; color: #92400E;">Log into your current registrar (GoDaddy, Namecheap, etc.) and unlock the domain <strong>${domainName}</strong>.</p>
                    </div>
                    
                    <div style="background: #DBEAFE; border-left: 4px solid #3B82F6; padding: 12px 16px; margin: 16px 0;">
                        <strong>Step 2: Get the Auth Code</strong>
                        <p style="margin: 8px 0 0 0; color: #1E40AF;">Get the Authorization Code (EPP Code) from your registrar and enter it in your <a href="https://domainliq.com/dashboard/orders" style="color: #2563EB;">Orders Dashboard</a>.</p>
                    </div>
                    
                    <div style="background: #D1FAE5; border-left: 4px solid #10B981; padding: 12px 16px; margin: 16px 0;">
                        <strong>Step 3: Mark as Transferred</strong>
                        <p style="margin: 8px 0 0 0; color: #065F46;">Click "Transfer Now" in your dashboard. We'll email the auth code to the buyer securely.</p>
                    </div>
                    
                    <div style="background: #EDE9FE; border-left: 4px solid #8B5CF6; padding: 12px 16px; margin: 16px 0;">
                        <strong>Step 4: Get Paid! 💰</strong>
                        <p style="margin: 8px 0 0 0; color: #5B21B6;">Once the buyer confirms receipt, your payout will be sent automatically.</p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;">
                    
                    <p style="color: #6B7280; font-size: 14px;">
                        <strong>Seller Protection:</strong> If the buyer doesn't confirm within 7 days, the funds will be released to you automatically.
                    </p>
                    
                    <a href="https://domainliq.com/dashboard/orders" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
                        Go to Orders Dashboard →
                    </a>
                </div>
            `,
        });
    } catch (emailError) {
        console.error('[Stripe Webhook] Failed to send seller email:', emailError);
    }

    // Send email to buyer
    try {
        await getResend().emails.send({
            from: 'DomainLiq <info@domainliq.com>',
            to: session.customer_details?.email || session.customer_email,
            subject: `✅ Order Confirmed: ${domainName}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #10B981;">✅ Your order has been confirmed!</h2>
                    
                    <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                        <p style="margin: 4px 0;"><strong>Domain:</strong> ${domainName}</p>
                        <p style="margin: 4px 0;"><strong>Amount Paid:</strong> $${(session.amount_total / 100).toFixed(2)}</p>
                    </div>
                    
                    <h3 style="color: #374151; margin-top: 24px;">📋 What happens next?</h3>
                    
                    <div style="background: #DBEAFE; border-left: 4px solid #3B82F6; padding: 12px 16px; margin: 16px 0;">
                        <strong>Step 1: Wait for the Auth Code</strong>
                        <p style="margin: 8px 0 0 0; color: #1E40AF;">The seller will unlock the domain and send us the Authorization Code (EPP Code). We'll email it to you as soon as we receive it.</p>
                    </div>
                    
                    <div style="background: #D1FAE5; border-left: 4px solid #10B981; padding: 12px 16px; margin: 16px 0;">
                        <strong>Step 2: Transfer the Domain</strong>
                        <p style="margin: 8px 0 0 0; color: #065F46;">Use the auth code to initiate a transfer at your preferred registrar (Namecheap, GoDaddy, Cloudflare, etc.).</p>
                    </div>
                    
                    <div style="background: #EDE9FE; border-left: 4px solid #8B5CF6; padding: 12px 16px; margin: 16px 0;">
                        <strong>Step 3: Confirm Receipt</strong>
                        <p style="margin: 8px 0 0 0; color: #5B21B6;">Once the transfer is complete, click the confirmation link in the email to release payment to the seller.</p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;">
                    
                    <p style="color: #6B7280; font-size: 14px;">
                        <strong>🔒 Buyer Protection:</strong> Your funds are held securely until you confirm the domain transfer. If something goes wrong, contact us at support@domainliq.com.
                    </p>
                </div>
            `,
        });
    } catch (emailError) {
        console.error('[Stripe Webhook] Failed to send buyer email:', emailError);
    }
}

async function handleAccountUpdated(account: any) {
    // Update onboarding status when Connect account is updated
    if (account.charges_enabled && account.payouts_enabled) {
        await db.user.updateMany({
            where: { stripeConnectedAccountId: account.id },
            data: { stripeOnboardingComplete: true },
        });
        console.log(`[Stripe Webhook] Account ${account.id} is now fully onboarded`);
    }
}
