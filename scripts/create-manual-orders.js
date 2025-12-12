// Manual order creation script for live sales
// Run with: node scripts/create-manual-orders.js

const { PrismaClient } = require('@prisma/client');
const { Resend } = require('resend');
const crypto = require('crypto');

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// Configuration - UPDATE THESE VALUES
const ORDERS_TO_CREATE = [
    {
        domainName: 'possible.bet',
        buyerEmail: 'stanley@watterson.ca',
        amount: 800, // in cents ($8.00)
        stripePaymentIntentId: 'pm_1SdOC6FasmoHOTtlhuWzLFQL',
    },
    {
        domainName: 'whatever.bet',
        buyerEmail: 'stanley@watterson.ca',
        amount: 1500, // in cents ($15.00)
        stripePaymentIntentId: 'pm_1SdODtFasmoHOTtltPssoIkS',
    },
];

async function createManualOrders() {
    console.log('Starting manual order creation...\n');

    for (const orderData of ORDERS_TO_CREATE) {
        try {
            console.log(`Processing: ${orderData.domainName}`);

            // Find the domain
            const domain = await prisma.domain.findUnique({
                where: { name: orderData.domainName },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            subdomain: true,
                            stripeConnectedAccountId: true,
                        },
                    },
                },
            });

            if (!domain) {
                console.log(`  ❌ Domain not found: ${orderData.domainName}`);
                continue;
            }

            console.log(`  Found domain: ${domain.name} (ID: ${domain.id})`);
            console.log(`  Seller: ${domain.user.email}`);

            // Check if order already exists
            const existingOrder = await prisma.order.findFirst({
                where: {
                    domainId: domain.id,
                    buyerEmail: orderData.buyerEmail,
                },
            });

            if (existingOrder) {
                console.log(`  ⚠️ Order already exists (ID: ${existingOrder.id})`);
                continue;
            }

            // Calculate fees (using new fee structure)
            const amount = orderData.amount / 100; // Convert to dollars
            let platformFee = 0;
            if (amount < 10) platformFee = 0;
            else if (amount <= 50) platformFee = 100;
            else if (amount <= 100) platformFee = 150;
            else platformFee = Math.round(orderData.amount * 0.02);

            const stripeFee = Math.round(orderData.amount * 0.029) + 30; // ~2.9% + $0.30
            const sellerPayout = orderData.amount - platformFee - stripeFee;

            // Create the order
            const order = await prisma.order.create({
                data: {
                    domainId: domain.id,
                    sellerId: domain.user.id,
                    buyerEmail: orderData.buyerEmail,
                    amount: orderData.amount,
                    platformFee: platformFee,
                    stripeFee: stripeFee,
                    sellerPayout: sellerPayout,
                    stripePaymentIntentId: orderData.stripePaymentIntentId,
                    status: 'paid',
                    revealToken: crypto.randomBytes(32).toString('hex'),
                },
            });

            console.log(`  ✅ Order created (ID: ${order.id})`);
            console.log(`     Amount: $${(orderData.amount / 100).toFixed(2)}`);
            console.log(`     Platform Fee: $${(platformFee / 100).toFixed(2)}`);
            console.log(`     Seller Payout: $${(sellerPayout / 100).toFixed(2)}`);

            // Send notification email to seller
            try {
                await resend.emails.send({
                    from: 'DomainLiq <noreply@domainliq.com>',
                    to: domain.user.email,
                    subject: `🎉 New Sale: ${domain.name} for $${(orderData.amount / 100).toFixed(2)}`,
                    html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>Congratulations! 🎉</h1>
              <p>Your domain <strong>${domain.name}</strong> has been purchased for <strong>$${(orderData.amount / 100).toFixed(2)}</strong>.</p>
              <p>Please log into your dashboard to provide the Authorization Code.</p>
              <p><a href="https://domainliq.com/dashboard/orders" style="background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">Go to Orders</a></p>
              <p style="color: #666; font-size: 14px; margin-top: 20px;">You have 48 hours to provide the auth code.</p>
            </div>
          `,
                });
                console.log(`  📧 Seller notification sent to ${domain.user.email}`);
            } catch (emailErr) {
                console.log(`  ⚠️ Failed to send seller email: ${emailErr.message}`);
            }

            console.log('');
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
        }
    }

    console.log('Done!');
    await prisma.$disconnect();
}

createManualOrders();
