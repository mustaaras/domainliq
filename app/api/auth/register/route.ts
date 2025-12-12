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
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #111; margin-bottom: 24px;">Welcome to DomainLiq! 🎉</h1>
                        
                        <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi ${name || 'there'},</p>
                        
                        <p style="color: #333; font-size: 16px; line-height: 1.6;">Thanks for joining DomainLiq! Your seller page is now live at:</p>
                        
                        <p style="margin: 20px 0;">
                            <a href="https://${subdomain.toLowerCase()}.domainliq.com" 
                               style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                                Visit Your Page
                            </a>
                        </p>
                        
                        <h2 style="color: #111; margin-top: 32px;">Get Started:</h2>
                        <ol style="color: #333; font-size: 16px; line-height: 1.8;">
                            <li>Add your first domain</li>
                            <li>Verify ownership</li>
                            <li>Set your price and start selling!</li>
                        </ol>
                        
                        <p style="color: #666; font-size: 14px; margin-top: 32px; padding-top: 20px; border-top: 1px solid #eee;">
                            Questions? You can contact us through <a href="https://domainliq.com/dashboard/chat" style="color: #f59e0b;">Messages on your dashboard</a>.
                        </p>
                        
                        <p style="color: #333; font-size: 16px; margin-top: 20px;">
                            Happy selling!<br/>
                            <strong>The DomainLiq Team</strong>
                        </p>
                    </div>
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
