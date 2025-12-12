import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Find user by email
        const user = await db.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        // Always return success to prevent email enumeration
        if (!user) {
            console.log('[Password Reset] Email not found:', email);
            return NextResponse.json({ success: true });
        }

        // Generate secure token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save token to database
        await db.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: resetToken,
                passwordResetExpires: resetExpires,
            },
        });

        // Send reset email
        const resetUrl = `https://domainliq.com/reset-password?token=${resetToken}`;

        try {
            await resend.emails.send({
                from: 'DomainLiq <noreply@domainliq.com>',
                to: user.email,
                subject: 'Reset Your Password - DomainLiq',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <title>Reset Your Password 🔒</title>
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
                                                <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin: 0 0 24px 0; text-align: center;">Reset Your Password 🔒</h1>
                                                
                                                <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
                                                    Hi ${user.name || 'there'},
                                                </p>
                                                
                                                <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 32px;">
                                                    We received a request to reset your password. Click the button below to choose a new one. This link is valid for 1 hour.
                                                </p>

                                                <div style="text-align: center; margin-bottom: 32px;">
                                                    <a href="${resetUrl}" style="display: inline-block; background-color: #F59E0B; color: #ffffff; font-weight: bold; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2);">
                                                        Reset Password
                                                    </a>
                                                </div>
                                                
                                                <p style="color: #6B7280; font-size: 14px; text-align: center;">
                                                    If you didn't request this, you can safely ignore this email.
                                                </p>
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
            console.log('[Password Reset] Email sent to:', user.email);
        } catch (emailError) {
            console.error('[Password Reset] Failed to send email:', emailError);
            // Still return success to prevent enumeration
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Password Reset] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
