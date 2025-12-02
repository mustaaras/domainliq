import { db } from '@/lib/db';
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { verifyDomainOwnership } from '@/lib/verify-domain';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Get user
        const user = await db.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get domain
        const domain = await db.domain.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!domain) {
            return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
        }

        if (domain.isVerified) {
            return NextResponse.json({
                verified: true,
                message: 'Domain already verified',
                verifiedAt: domain.verifiedAt,
            });
        }

        if (!domain.verificationToken) {
            return NextResponse.json(
                { error: 'No verification token found' },
                { status: 400 }
            );
        }

        // Perform DNS verification
        console.log(`[Verification] Checking domain: ${domain.name}`);
        const result = await verifyDomainOwnership(domain.name, domain.verificationToken);

        if (!result.verified) {
            return NextResponse.json(
                {
                    verified: false,
                    error: result.error || 'Domain verification failed',
                },
                { status: 400 }
            );
        }

        // Update domain as verified
        const updatedDomain = await db.domain.update({
            where: { id },
            data: {
                isVerified: true,
                verificationMethod: result.method,
                verifiedAt: new Date(),
            },
        });

        console.log(`[Verification] Domain verified: ${domain.name} via ${result.method}`);

        // If domain points to our server, register with Coolify for SSL
        if (result.pointsToServer) {
            console.log(`[Verification] Domain points to server, registering with Coolify`);

            try {
                const coolifyResponse = await fetch(`${req.nextUrl.origin}/api/coolify/add-domain`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ domain: domain.name }),
                });

                if (!coolifyResponse.ok) {
                    console.error(`[Coolify] Failed to register ${domain.name}`);
                } else {
                    console.log(`[Coolify] Successfully registered ${domain.name}`);
                }
            } catch (coolifyError) {
                console.error('[Coolify] Error registering domain:', coolifyError);
                // Don't fail verification if Coolify fails
            }
        }

        return NextResponse.json({
            verified: true,
            method: result.method,
            pointsToServer: result.pointsToServer,
            verifiedAt: updatedDomain.verifiedAt,
            message: 'Domain verified successfully!',
        });
    } catch (error: any) {
        console.error('[Verification] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
