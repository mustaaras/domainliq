import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, subdomain } = await req.json();

        if (!email || !password || !subdomain) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if email or subdomain already exists
        const existingUser = await db.user.findFirst({
            where: {
                OR: [
                    { email },
                    { subdomain },
                ],
            },
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return NextResponse.json(
                    { error: 'Email already exists' },
                    { status: 400 }
                );
            }
            if (existingUser.subdomain === subdomain) {
                return NextResponse.json(
                    { error: 'Username already taken' },
                    { status: 400 }
                );
            }
        }

        // Check if subdomain is reserved (Hardcoded list)
        const reservedSubdomains = ['market', 'marketplace', 'store', 'shop', 'buy', 'sell', 'checkout', 'pay', 'admin', 'api', 'www', 'mail', 'support', 'help', 'status'];
        if (reservedSubdomains.includes(subdomain.toLowerCase())) {
            return NextResponse.json(
                { error: 'This subdomain is reserved and cannot be used.' },
                { status: 400 }
            );
        }

        // Validate subdomain format (alphanumeric and hyphens only, no dots)
        const subdomainRegex = /^[a-z0-9-]+$/;
        if (!subdomainRegex.test(subdomain.toLowerCase())) {
            return NextResponse.json(
                { error: 'Subdomain can only contain letters, numbers, and hyphens. Dots (.) are not allowed.' },
                { status: 400 }
            );
        }


        // Check if subdomain is reserved (DB check)
        const isReserved = await db.reservedSubdomain.findUnique({
            where: { name: subdomain.toLowerCase() },
        });

        if (isReserved) {
            return NextResponse.json(
                { error: 'This subdomain is reserved and cannot be used.' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                subdomain: subdomain.toLowerCase(),
            },
        });

        // Create Welcome Support Chat
        try {
            const session = await db.chatSession.create({
                data: {
                    userId: user.id,
                    visitorId: 'ADMIN',
                    visitorName: 'DomainLiq Support',
                    visitorEmail: 'support@domainliq.com',
                    domainId: null,
                },
            });

            await db.chatMessage.create({
                data: {
                    sessionId: session.id,
                    sender: 'visitor', // Admin
                    content: 'Welcome to DomainLiq! If you have any questions, you can ask them directly here. Our support team will reply as soon as possible.',
                    read: false,
                },
            });
        } catch (chatError) {
            console.error('Failed to create welcome chat:', chatError);
            // Don't fail registration
        }

        // Register subdomain with Coolify for automatic SSL
        const userSubdomain = `${subdomain.toLowerCase()}.domainliq.com`;
        try {
            const coolifyResponse = await fetch(`${req.nextUrl.origin}/api/coolify/add-domain`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: userSubdomain }),
            });

            if (!coolifyResponse.ok) {
                console.error(`[Coolify] Failed to register subdomain: ${userSubdomain}`);
            } else {
                console.log(`[Coolify] Successfully registered subdomain: ${userSubdomain}`);
            }
        } catch (coolifyError) {
            console.error('[Coolify] Error registering subdomain:', coolifyError);
            // Don't fail registration if Coolify fails
        }

        // Send Welcome Email
        try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
                from: 'DomainLiq <noreply@domainliq.com>',
                to: email,
                subject: 'Welcome to DomainLiq! 🎉',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <title>Welcome to DomainLiq! 🎉</title>
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
                                                <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin: 0 0 24px 0; text-align: center;">Welcome to DomainLiq! 🎉</h1>
                                                
                                                <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
                                                    Hi ${name || 'there'},
                                                </p>
                                                
                                                <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
                                                    Thanks for joining DomainLiq! Your seller page is now live and ready to view.
                                                </p>

                                                <div style="background-color: #FFFBEB; border: 1px solid #FCD34D; border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: center;">
                                                    <p style="margin: 0 0 12px 0; color: #92400E; font-weight: 600;">Your Storefront URL:</p>
                                                    <a href="https://${subdomain.toLowerCase()}.domainliq.com" style="color: #F59E0B; font-size: 18px; font-weight: bold; text-decoration: none;">https://${subdomain.toLowerCase()}.domainliq.com</a>
                                                </div>
                                                
                                                <h3 style="color: #111827; font-size: 18px; font-weight: bold; margin: 0 0 16px 0;">Get Started:</h3>
                                                
                                                <div style="margin-bottom: 32px;">
                                                     <div style="display: flex; margin-bottom: 16px;">
                                                        <div style="width: 24px; height: 24px; background-color: #F3F4F6; color: #374151; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 14px; margin-right: 12px; flex-shrink: 0;">1</div>
                                                        <span style="color: #374151;">Add your first domain for sale</span>
                                                    </div>
                                                    <div style="display: flex; margin-bottom: 16px;">
                                                        <div style="width: 24px; height: 24px; background-color: #F3F4F6; color: #374151; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 14px; margin-right: 12px; flex-shrink: 0;">2</div>
                                                        <span style="color: #374151;">Verify your ownership (via DNS)</span>
                                                    </div>
                                                    <div style="display: flex;">
                                                        <div style="width: 24px; height: 24px; background-color: #F3F4F6; color: #374151; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 14px; margin-right: 12px; flex-shrink: 0;">3</div>
                                                        <span style="color: #374151;">Connect Stripe to get paid</span>
                                                    </div>
                                                </div>

                                                <div style="text-align: center;">
                                                    <a href="https://domainliq.com/dashboard" style="display: inline-block; background-color: #F59E0B; color: #ffffff; font-weight: bold; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2);">
                                                        Go to Dashboard
                                                    </a>
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
                `
            });
            console.log(`[Email] Welcome email sent to: ${email}`);
        } catch (emailError) {
            console.error('[Email] Failed to send welcome email:', emailError);
            // Don't fail registration if email fails
        }

        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
