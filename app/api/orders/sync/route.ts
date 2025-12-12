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
        const resend = new Resend(process.env.RESEND_API_KEY);
        const buyerEmail = session.customer_details?.email;
        const amountFormatted = ((session.amount_total || 0) / 100).toFixed(2);

        try {
            // Email to seller
            await resend.emails.send({
                from: 'DomainLiq Orders <info@domainliq.com>',
                to: seller.email,
                subject: `You sold a domain! ${domainName}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <title>New Sale Notification</title>
                    </head>
                    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td align="center" style="padding: 40px 0;">
                                    <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                                        <!-- Header -->
                                        <tr>
                                            <td style="padding: 32px; background-color: #000000; text-align: center;">
                                                <img src="https://domainliq.com/icon-512.png" alt="DomainLiq" width="48" height="48" style="display: inline-block; vertical-align: middle;">
                                                <span style="color: #ffffff; font-size: 24px; font-weight: bold; vertical-align: middle; margin-left: 12px;">DomainLiq</span>
                                            </td>
                                        </tr>

                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 40px 32px;">
                                                <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin: 0 0 24px 0; text-align: center;">Congratulations! You made a sale! 🎉</h1>
                                                
                                                <div style="background-color: #FFFBEB; border: 1px solid #FCD34D; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                        <tr>
                                                            <td style="padding-bottom: 8px;">
                                                                <p style="margin: 0; color: #92400E; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Domain Sold</p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding-bottom: 16px;">
                                                                <p style="margin: 0; color: #111827; font-size: 20px; font-weight: bold;">${domainName}</p>
                                                            </td>
                                                        </tr>
                                                         <tr>
                                                            <td style="padding-bottom: 8px;">
                                                                <p style="margin: 0; color: #92400E; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Sale Price</p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <p style="margin: 0; color: #059669; font-size: 24px; font-weight: bold;">$${amountFormatted}</p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </div>

                                                <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
                                                    The buyer has completed payment. Now proceed to your dashboard to complete the transfer.
                                                </p>

                                                <h3 style="color: #111827; font-size: 18px; font-weight: bold; margin: 0 0 16px 0;">Next Steps:</h3>

                                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                                                    <tr>
                                                        <td width="32" valign="top" style="padding-bottom: 24px;">
                                                            <div style="width: 24px; height: 24px; background-color: #F59E0B; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 14px;">1</div>
                                                        </td>
                                                        <td style="padding-left: 16px; padding-bottom: 24px;">
                                                            <strong style="display: block; color: #111827; margin-bottom: 4px;">Unlock Your Domain</strong>
                                                            <span style="color: #4B5563; font-size: 14px;">Log in to your registrar and unlock ${domainName}.</span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td width="32" valign="top" style="padding-bottom: 24px;">
                                                            <div style="width: 24px; height: 24px; background-color: #F59E0B; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 14px;">2</div>
                                                        </td>
                                                        <td style="padding-left: 16px; padding-bottom: 24px;">
                                                            <strong style="display: block; color: #111827; margin-bottom: 4px;">Get Auth Code</strong>
                                                            <span style="color: #4B5563; font-size: 14px;">Get the EPP/Auth code from your registrar.</span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td width="32" valign="top">
                                                            <div style="width: 24px; height: 24px; background-color: #F59E0B; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 14px;">3</div>
                                                        </td>
                                                        <td style="padding-left: 16px;">
                                                            <strong style="display: block; color: #111827; margin-bottom: 4px;">Complete Transfer</strong>
                                                            <span style="color: #4B5563; font-size: 14px;">Enter the code in your dashboard to start the transfer.</span>
                                                        </td>
                                                    </tr>
                                                </table>

                                                <div style="text-align: center;">
                                                    <a href="https://domainliq.com/dashboard/orders" style="display: inline-block; background-color: #F59E0B; color: #ffffff; font-weight: bold; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2);">
                                                        Go to Orders Dashboard
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>

                                        <!-- Footer -->
                                        <tr>
                                            <td style="padding: 32px; background-color: #F3F4F6; text-align: center;">
                                                <p style="margin: 0 0 16px 0; color: #6B7280; font-size: 14px;">
                                                    <strong>Seller Protection:</strong> Funds are automatically released to you if the buyer does not confirm receipt within 7 days.
                                                </p>
                                                <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                                                    &copy; ${new Date().getFullYear()} DomainLiq. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                `,
            });
            console.log(`[Order Sync] Seller notification email sent for order ${order.id}`);
        } catch (emailError) {
            console.error('[Order Sync] Failed to send seller email:', emailError);
        }

        // Send Email to Buyer
        try {
            if (buyerEmail) {
                await resend.emails.send({
                    from: 'DomainLiq Orders <info@domainliq.com>',
                    to: buyerEmail,
                    subject: `Order Confirmed: ${domainName}`,
                    html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <title>Order Confirmation</title>
                    </head>
                    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td align="center" style="padding: 40px 0;">
                                    <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                                        <!-- Header -->
                                        <tr>
                                            <td style="padding: 32px; background-color: #000000; text-align: center;">
                                                <img src="https://domainliq.com/icon-512.png" alt="DomainLiq" width="48" height="48" style="display: inline-block; vertical-align: middle;">
                                                <span style="color: #ffffff; font-size: 24px; font-weight: bold; vertical-align: middle; margin-left: 12px;">DomainLiq</span>
                                            </td>
                                        </tr>

                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 40px 32px;">
                                                <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin: 0 0 24px 0; text-align: center;">Order Confirmed! ✅</h1>
                                                
                                                <div style="background-color: #ECFDF5; border: 1px solid #6EE7B7; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                        <tr>
                                                            <td style="padding-bottom: 8px;">
                                                                <p style="margin: 0; color: #065F46; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">You Purchased</p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding-bottom: 16px;">
                                                                <p style="margin: 0; color: #111827; font-size: 20px; font-weight: bold;">${domainName}</p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding-bottom: 8px;">
                                                                <p style="margin: 0; color: #065F46; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Amount Paid</p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <p style="margin: 0; color: #059669; font-size: 24px; font-weight: bold;">$${amountFormatted}</p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </div>

                                                <h3 style="color: #111827; font-size: 18px; font-weight: bold; margin: 0 0 16px 0;">What happens next?</h3>

                                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                                                    <tr>
                                                        <td width="32" valign="top" style="padding-bottom: 24px;">
                                                            <div style="width: 24px; height: 24px; background-color: #F59E0B; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 14px;">1</div>
                                                        </td>
                                                        <td style="padding-left: 16px; padding-bottom: 24px;">
                                                            <strong style="display: block; color: #111827; margin-bottom: 4px;">Wait for Auth Code</strong>
                                                            <span style="color: #4B5563; font-size: 14px;">The seller will provide the authorization code. We'll email it to you as soon as we receive it.</span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td width="32" valign="top" style="padding-bottom: 24px;">
                                                            <div style="width: 24px; height: 24px; background-color: #F59E0B; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 14px;">2</div>
                                                        </td>
                                                        <td style="padding-left: 16px; padding-bottom: 24px;">
                                                            <strong style="display: block; color: #111827; margin-bottom: 4px;">Transfer Domain</strong>
                                                            <span style="color: #4B5563; font-size: 14px;">Use the code to transfer the domain to your registrar (GoDaddy, Namecheap, etc.).</span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td width="32" valign="top">
                                                            <div style="width: 24px; height: 24px; background-color: #F59E0B; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 14px;">3</div>
                                                        </td>
                                                        <td style="padding-left: 16px;">
                                                            <strong style="display: block; color: #111827; margin-bottom: 4px;">Confirm Receipt</strong>
                                                            <span style="color: #4B5563; font-size: 14px;">Click the link in the transfer email to confirm you received the domain.</span>
                                                        </td>
                                                    </tr>
                                                </table>
                                                
                                                <div style="padding: 16px; background-color: #F3F4F6; border-radius: 8px; border-left: 4px solid #F59E0B;">
                                                    <p style="margin: 0; color: #4B5563; font-size: 14px;">
                                                        <strong>🔒 Buyer Protection:</strong> Your funds are held securely until you confirm the transfer.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>

                                        <!-- Footer -->
                                        <tr>
                                            <td style="padding: 32px; background-color: #F3F4F6; text-align: center;">
                                                <p style="margin: 0 0 16px 0; color: #6B7280; font-size: 14px;">
                                                    Need help? Contact us at <a href="mailto:support@domainliq.com" style="color: #F59E0B; text-decoration: none;">support@domainliq.com</a>
                                                </p>
                                                <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                                                    &copy; ${new Date().getFullYear()} DomainLiq. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                    `,
                });
            }
        } catch (emailError) {
            console.error('[Order Sync] Failed to send buyer email:', emailError);
        }

        return NextResponse.json({ success: true, orderId: order.id, status: 'created' });

    } catch (error: any) {
        console.error('[Order Sync] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
