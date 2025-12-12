import { NextResponse } from 'next/server';
import { auth } from '@/auth';
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


export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: orderId } = await params;
        const body = await req.json();
        const { authCode } = body;

        // Get order with domain and seller
        const order = await db.order.findUnique({
            where: { id: orderId },
            include: {
                domain: true,
                seller: true,
            },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Verify the logged-in user is the seller
        if (order.seller.email !== session.user.email) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        if (order.status !== 'paid') {
            return NextResponse.json({ error: 'Order is not in paid status' }, { status: 400 });
        }

        // Update order status
        const autoReleaseAt = new Date();
        autoReleaseAt.setDate(autoReleaseAt.getDate() + 7); // 7 days from now

        const updatedOrder = await db.order.update({
            where: { id: orderId },
            data: {
                status: 'transferred',
                transferredAt: new Date(),
                autoReleaseAt,
                authCode: authCode || null,
            },
        });

        // Send confirmation email to buyer
        const baseUrl = process.env.NEXTAUTH_URL || 'https://domainliq.com';
        const revealUrl = `${baseUrl}/order/reveal?token=${order.buyerConfirmationToken}`;

        try {
            await getResend().emails.send({
                from: 'DomainLiq <info@domainliq.com>',
                to: order.buyerEmail,
                subject: `🔑 Action Required: Your domain ${order.domain.name} is ready`,
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #10B981;">🎉 Great news! Your domain is ready.</h2>
                        
                        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                            <p style="margin: 4px 0;"><strong>Domain:</strong> ${order.domain.name}</p>
                            <p style="margin: 4px 0;"><strong>Amount:</strong> $${(order.amount / 100).toFixed(2)}</p>
                        </div>
                        
                        <p style="color: #374151;">The seller has unlocked the domain and provided the transfer details. Click the button below to:</p>
                        
                        <ul style="color: #4B5563;">
                            <li>Securely reveal your Authorization Code</li>
                            <li>Get transfer instructions</li>
                            <li>Confirm receipt once transferred</li>
                        </ul>
                        
                        <a href="${revealUrl}" style="display: inline-block; padding: 14px 28px; background: #4F46E5; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold;">
                            View Transfer Details →
                        </a>
                        
                        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;">
                        
                        <p style="color: #6B7280; font-size: 14px;">
                            <strong>Why click the link?</strong> For your security, the authorization code is only shown on our website, not in this email.
                        </p>
                        
                        <p style="color: #6B7280; font-size: 14px;">
                            If you don't confirm within 7 days, the funds will be released automatically to the seller.
                        </p>
                    </div>
                `,
            });
        } catch (emailError) {
            console.error('[Order] Failed to send confirmation email:', emailError);
        }

        return NextResponse.json({
            success: true,
            order: updatedOrder,
            message: 'Domain marked as transferred. Buyer has been notified.',
        });

    } catch (error) {
        console.error('[Order Mark Transferred] Error:', error);
        return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
        );
    }
}

