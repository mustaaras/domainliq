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
            from: 'DomainLiq <noreply@domainliq.com>',
            to: seller.email,
            subject: `🎉 New Sale: ${domainName} for $${(session.amount_total / 100).toFixed(2)}`,
            html: `
                <h2>Congratulations! You have a new sale!</h2>
                <p><strong>Domain:</strong> ${domainName}</p>
                <p><strong>Amount:</strong> $${(session.amount_total / 100).toFixed(2)}</p>
                <p><strong>Buyer:</strong> ${session.customer_details?.email || 'Unknown'}</p>
                <hr>
                <h3>Next Steps:</h3>
                <ol>
                    <li>Transfer the domain <strong>${domainName}</strong> to the buyer's email: <strong>${session.customer_details?.email}</strong></li>
                    <li>Once transferred, go to your <a href="https://domainliq.com/dashboard/orders">Orders Dashboard</a> and click "Mark as Transferred"</li>
                    <li>The buyer will confirm receipt, and you'll receive your payout!</li>
                </ol>
                <p>If the buyer doesn't confirm within 7 days, the funds will be released automatically.</p>
            `,
        });
    } catch (emailError) {
        console.error('[Stripe Webhook] Failed to send seller email:', emailError);
    }

    // Send email to buyer
    try {
        await getResend().emails.send({
            from: 'DomainLiq <noreply@domainliq.com>',
            to: session.customer_details?.email || session.customer_email,
            subject: `Order Confirmed: ${domainName}`,
            html: `
                <h2>Your order has been confirmed!</h2>
                <p><strong>Domain:</strong> ${domainName}</p>
                <p><strong>Amount:</strong> $${(session.amount_total / 100).toFixed(2)}</p>
                <hr>
                <h3>What happens next?</h3>
                <p>The seller will transfer the domain to your email address: <strong>${session.customer_details?.email}</strong></p>
                <p>Once you receive the domain, you'll get an email with a link to confirm receipt.</p>
                <p>Your funds are held securely until you confirm the transfer.</p>
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
