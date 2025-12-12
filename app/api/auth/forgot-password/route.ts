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
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <span style="color: #f59e0b; font-weight: bold; font-size: 24px;">DomainLiq</span>
                        </div>
                        
                        <h1 style="color: #111; margin-bottom: 24px;">Reset Your Password</h1>
                        
                        <p style="color: #333; font-size: 16px; line-height: 1.6;">
                            Hi ${user.name || 'there'},
                        </p>
                        
                        <p style="color: #333; font-size: 16px; line-height: 1.6;">
                            We received a request to reset your password. Click the button below to set a new password:
                        </p>
                        
                        <p style="margin: 30px 0; text-align: center;">
                            <a href="${resetUrl}" 
                               style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                                Reset Password
                            </a>
                        </p>
                        
                        <p style="color: #666; font-size: 14px; line-height: 1.6;">
                            This link will expire in <strong>1 hour</strong>.
                        </p>
                        
                        <p style="color: #666; font-size: 14px; line-height: 1.6;">
                            If you didn't request this, you can safely ignore this email.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                        
                        <p style="color: #999; font-size: 12px;">
                            Can't click the button? Copy and paste this link:<br/>
                            <a href="${resetUrl}" style="color: #f59e0b; word-break: break-all;">${resetUrl}</a>
                        </p>
                    </div>
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
