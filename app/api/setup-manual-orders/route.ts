import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// ONE-TIME SCRIPT: Delete this file after running!
// Visit: https://domainliq.com/api/setup-manual-orders?secret=domainliq2024

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    // Simple protection
    if (secret !== 'domainliq2024') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = [
        { domain: 'possible.bet', email: 'stanley@watterson.ca', amount: 800, paymentId: 'pm_1SdOC6FasmoHOTtlhuWzLFQL' },
        { domain: 'whatever.bet', email: 'stanley@watterson.ca', amount: 1500, paymentId: 'pm_1SdODtFasmoHOTtltPssoIkS' },
    ];

    const results = [];

    for (const o of orders) {
        try {
            const domain = await db.domain.findUnique({
                where: { name: o.domain },
                include: { user: true },
            });

            if (!domain) {
                results.push({ domain: o.domain, status: 'error', message: 'Domain not found' });
                continue;
            }

            // Check if order already exists
            const existing = await db.order.findFirst({
                where: { domainId: domain.id, buyerEmail: o.email },
            });

            if (existing) {
                results.push({ domain: o.domain, status: 'skipped', message: 'Order already exists', orderId: existing.id });
                continue;
            }

            const platformFee = o.amount < 1000 ? 0 : 100;
            const stripeFee = Math.round(o.amount * 0.029) + 30;

            const order = await db.order.create({
                data: {
                    domainId: domain.id,
                    sellerId: domain.userId,
                    buyerEmail: o.email,
                    amount: o.amount,
                    platformFee,
                    stripeFee,
                    sellerPayout: o.amount - platformFee - stripeFee,
                    stripePaymentIntentId: o.paymentId,
                    status: 'paid',
                    revealToken: crypto.randomBytes(32).toString('hex'),
                },
            });

            results.push({ domain: o.domain, status: 'created', orderId: order.id });
        } catch (error: any) {
            results.push({ domain: o.domain, status: 'error', message: error.message });
        }
    }

    return NextResponse.json({
        message: 'Manual orders setup complete',
        results,
        nextStep: 'Go to /dashboard/orders and click Transfer Now to enter auth codes',
    });
}
