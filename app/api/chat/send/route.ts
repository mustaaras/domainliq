import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { sendChatNotification } from '@/lib/sendgrid';

export async function POST(req: NextRequest) {
    try {
        const { domainId, content, visitorId, visitorName, visitorEmail } = await req.json();

        if (!domainId || !content || !visitorId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Find or create session
        let session = await db.chatSession.findFirst({
            where: {
                domainId,
                visitorId,
            },
        });

        const isNewSession = !session;

        if (!session) {
            session = await db.chatSession.create({
                data: {
                    domainId,
                    visitorId,
                    visitorName,
                    visitorEmail,
                },
            });
        } else {
            // Update visitor info if provided
            if (visitorName || visitorEmail) {
                await db.chatSession.update({
                    where: { id: session.id },
                    data: {
                        visitorName: visitorName || session.visitorName,
                        visitorEmail: visitorEmail || session.visitorEmail,
                    },
                });
            }
        }

        // Create message
        const message = await db.chatMessage.create({
            data: {
                sessionId: session.id,
                sender: 'visitor',
                content,
            },
        });

        // Update session updated at
        await db.chatSession.update({
            where: { id: session.id },
            data: { updatedAt: new Date() },
        });

        // Send email notification on first message (new session only)
        if (isNewSession && domainId) {
            // Get domain and seller info
            const domain = await db.domain.findUnique({
                where: { id: domainId },
                include: {
                    user: {
                        select: {
                            email: true,
                            name: true,
                            subdomain: true,
                        },
                    },
                },
            });

            if (domain?.user?.email) {
                const baseUrl = process.env.NEXTAUTH_URL || 'https://domainliq.com';

                // Fire and forget - don't block the response
                sendChatNotification({
                    sellerEmail: domain.user.email,
                    sellerName: domain.user.name || domain.user.subdomain || 'Seller',
                    domainName: domain.name,
                    visitorName: visitorName || undefined,
                    visitorEmail: visitorEmail || undefined,
                    messagePreview: content,
                    chatUrl: `${baseUrl}/dashboard?tab=chats`,
                }).catch(err => console.error('[Chat] Email notification failed:', err));
            }
        }

        return NextResponse.json({ message, session });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
