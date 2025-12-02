import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { domain, price, buyerEmail, sellerEmail } = await req.json();

        if (!domain || !price || !buyerEmail || !sellerEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (buyerEmail.toLowerCase() === sellerEmail.toLowerCase()) {
            return NextResponse.json({ error: 'Buyer and Seller cannot have the same email address.' }, { status: 400 });
        }

        const ESCROW_EMAIL = process.env.ESCROW_EMAIL;
        const ESCROW_API_KEY = process.env.ESCROW_API_KEY;

        if (!ESCROW_EMAIL || !ESCROW_API_KEY) {
            console.error('Escrow credentials missing');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Ensure the authenticated user (from env) is the Broker
        const brokerEmail = ESCROW_EMAIL;

        if (buyerEmail.toLowerCase() === sellerEmail.toLowerCase()) {
            return NextResponse.json({ error: 'Buyer and Seller cannot have the same email address.' }, { status: 400 });
        }

        if (brokerEmail.toLowerCase() === sellerEmail.toLowerCase() || brokerEmail.toLowerCase() === buyerEmail.toLowerCase()) {
            // It's okay if broker is seller (selling own domains), but let's handle the general case
        }

        // Base64 encode credentials
        const auth = Buffer.from(`${ESCROW_EMAIL}:${ESCROW_API_KEY}`).toString('base64');

        const requestBody = {
            description: `Purchase of ${domain}`,
            currency: 'usd',
            items: [{
                title: domain,
                description: `Domain name purchase: ${domain}`,
                type: 'domain_name',
                inspection_period: 259200, // 3 days in seconds
                quantity: 1,
                schedule: [{
                    amount: price,
                    payer_customer: buyerEmail, // The buyer pays
                    beneficiary_customer: sellerEmail, // The seller receives
                }],
            }],
            parties: [
                {
                    customer: buyerEmail,
                    role: 'buyer',
                },
                {
                    customer: sellerEmail,
                    role: 'seller',
                },
                // Only add broker as separate party if broker is NOT the seller or buyer
                ...(brokerEmail.toLowerCase() !== sellerEmail.toLowerCase() &&
                    brokerEmail.toLowerCase() !== buyerEmail.toLowerCase() ? [{
                        customer: brokerEmail,
                        role: 'broker' as const,
                        visibility: {
                            hidden_from: [buyerEmail, sellerEmail]
                        }
                    }] : [])
            ]
        };

        // Create transaction
        const response = await fetch('https://api.escrow.com/2017-09-01/transaction', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                error: data.message || 'Failed to create transaction',
                details: data
            }, { status: response.status });
        }

        // Extract the buyer's next_step URL from the parties array
        const buyerParty = data.parties?.find((party: any) => party.role === 'buyer');

        const landingPage = buyerParty?.next_step || data.landing_page || data.url;

        if (!landingPage) {
            return NextResponse.json({
                error: 'Transaction created but no redirect URL available',
                transaction_id: data.id,
                full_response: data
            }, { status: 500 });
        }

        return NextResponse.json({
            landing_page: landingPage,
            transaction_id: data.id,
            full_response: data  // Send full response for debugging
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
