import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

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
