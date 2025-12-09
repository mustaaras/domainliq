import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { stripe, createConnectAccount, createConnectOnboardingLink } from '@/lib/stripe';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Beta: Only allow specific users to use Stripe Connect
        const BETA_USERS = ['huldil@icloud.com'];
        if (!BETA_USERS.includes(user.email)) {
            return NextResponse.json({ error: 'Stripe Connect is currently in beta' }, { status: 403 });
        }

        let accountId = user.stripeConnectedAccountId;

        // Create new Connect account if none exists
        if (!accountId) {
            accountId = await createConnectAccount(user.email);

            await db.user.update({
                where: { id: user.id },
                data: { stripeConnectedAccountId: accountId },
            });
        }

        // Create onboarding link
        const baseUrl = process.env.NEXTAUTH_URL || 'https://domainliq.com';
        const returnUrl = `${baseUrl}/settings?tab=integrations&stripe=success`;
        const refreshUrl = `${baseUrl}/settings?tab=integrations&stripe=refresh`;

        const onboardingLink = await createConnectOnboardingLink(
            accountId,
            returnUrl,
            refreshUrl
        );

        return NextResponse.json({ url: onboardingLink });

    } catch (error) {
        console.error('[Stripe Connect] Error:', error);
        return NextResponse.json(
            { error: 'Failed to create Stripe Connect link' },
            { status: 500 }
        );
    }
}

// Check Connect account status
export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email },
            select: {
                stripeConnectedAccountId: true,
                stripeOnboardingComplete: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.stripeConnectedAccountId) {
            return NextResponse.json({
                connected: false,
                onboardingComplete: false,
            });
        }

        // Check actual status from Stripe
        const account = await stripe.accounts.retrieve(user.stripeConnectedAccountId);
        const isComplete = account.charges_enabled && account.payouts_enabled;

        // Update DB if status changed
        if (isComplete !== user.stripeOnboardingComplete) {
            await db.user.update({
                where: { email: session.user.email },
                data: { stripeOnboardingComplete: isComplete },
            });
        }

        return NextResponse.json({
            connected: true,
            onboardingComplete: isComplete,
            accountId: user.stripeConnectedAccountId,
        });

    } catch (error) {
        console.error('[Stripe Connect] Status check error:', error);
        return NextResponse.json(
            { error: 'Failed to check Stripe status' },
            { status: 500 }
        );
    }
}
