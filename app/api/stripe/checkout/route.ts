import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { stripe, calculatePlatformFee } from '@/lib/stripe';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { domainId } = body;

        if (!domainId) {
            return NextResponse.json({ error: 'Domain ID required' }, { status: 400 });
        }

        // Get domain with seller info
        const domain = await db.domain.findUnique({
            where: { id: domainId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        stripeConnectedAccountId: true,
                        stripeOnboardingComplete: true,
                    },
                },
            },
        });

        if (!domain) {
            return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
        }

        // Prevent purchasing domains that are already sold or in progress
        if (domain.status === 'sold') {
            return NextResponse.json({ error: 'This domain has already been sold' }, { status: 400 });
        }
        if (domain.status === 'pending_transfer') {
            return NextResponse.json({ error: 'This domain is currently being transferred to another buyer' }, { status: 400 });
        }

        if (!domain.isVerified) {
            return NextResponse.json({ error: 'Domain must be verified for sale' }, { status: 400 });
        }

        if (!domain.price || domain.price <= 0) {
            return NextResponse.json({ error: 'Domain has no price set' }, { status: 400 });
        }

        if (!domain.user.stripeConnectedAccountId || !domain.user.stripeOnboardingComplete) {
            return NextResponse.json({ error: 'Seller has not connected Stripe' }, { status: 400 });
        }

        // Calculate amounts
        const amountCents = Math.round(domain.price * 100);
        const platformFeeCents = calculatePlatformFee(amountCents);

        // Create Stripe Checkout Session
        const baseUrl = process.env.NEXTAUTH_URL || 'https://domainliq.com';

        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: domain.name,
                            description: `Purchase of domain: ${domain.name}`,
                        },
                        unit_amount: amountCents,
                    },
                    quantity: 1,
                },
            ],
            // Separate Charges: Funds go to platform first, transferred to seller when buyer confirms
            // This provides true escrow behavior for buyer protection
            customer_email: undefined, // Let buyer enter their email
            metadata: {
                domainId: domain.id,
                domainName: domain.name,
                sellerId: domain.userId,
                sellerStripeAccountId: domain.user.stripeConnectedAccountId,
                platformFee: platformFeeCents.toString(),
            },
            success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/d/${domain.name}?checkout=cancelled`,
        });

        return NextResponse.json({
            url: checkoutSession.url,
            sessionId: checkoutSession.id,
        });

    } catch (error) {
        console.error('[Stripe Checkout] Error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
