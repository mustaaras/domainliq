import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
    if (!_stripe) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not set');
        }
        _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-11-17.clover',
            typescript: true,
        });
    }
    return _stripe;
}

// For backwards compatibility
export const stripe = {
    get accounts() { return getStripe().accounts; },
    get accountLinks() { return getStripe().accountLinks; },
    get checkout() { return getStripe().checkout; },
    get transfers() { return getStripe().transfers; },
    get webhooks() { return getStripe().webhooks; },
};

/**
 * Calculate platform fee based on tiered structure:
 * - $0-50: 0%
 * - $50-500: 5%
 * - $500-2000: 3%
 * - $2000+: 2%
 * 
 * @param amountCents - Amount in cents
 * @returns Platform fee in cents
 */
export function calculatePlatformFee(amountCents: number): number {
    const amount = amountCents / 100; // Convert to dollars

    if (amount <= 50) return 0;
    if (amount <= 500) return Math.round(amountCents * 0.05);  // 5%
    if (amount <= 2000) return Math.round(amountCents * 0.03); // 3%
    return Math.round(amountCents * 0.02);                      // 2%
}

/**
 * Get the fee tier description for display
 */
export function getFeeTierDescription(amountCents: number): string {
    const amount = amountCents / 100;

    if (amount <= 50) return 'Free (no platform fee)';
    if (amount <= 500) return '5% platform fee';
    if (amount <= 2000) return '3% platform fee';
    return '2% platform fee';
}

/**
 * Create Stripe Connect onboarding link
 */
export async function createConnectOnboardingLink(
    accountId: string,
    returnUrl: string,
    refreshUrl: string
): Promise<string> {
    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
    });

    return accountLink.url;
}

/**
 * Create a new Stripe Connect Express account
 */
export async function createConnectAccount(email: string): Promise<string> {
    const account = await stripe.accounts.create({
        type: 'express',
        email,
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
    });

    return account.id;
}

/**
 * Check if a Connect account is fully onboarded
 */
export async function isAccountOnboarded(accountId: string): Promise<boolean> {
    const account = await stripe.accounts.retrieve(accountId);
    return account.charges_enabled && account.payouts_enabled;
}

/**
 * Create a payout to a connected account
 */
export async function createTransferToSeller(
    amountCents: number,
    connectedAccountId: string,
    orderId: string
): Promise<string> {
    const transfer = await stripe.transfers.create({
        amount: amountCents,
        currency: 'usd',
        destination: connectedAccountId,
        metadata: {
            orderId,
        },
    });

    return transfer.id;
}
