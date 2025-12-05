
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Sending welcome messages to existing users...');

    try {
        const users = await prisma.user.findMany();

        for (const user of users) {
            // Check if a welcome chat exists
            const existingSession = await prisma.chatSession.findFirst({
                where: {
                    userId: user.id,
                    visitorId: 'ADMIN',
                },
            });

            if (!existingSession) {
                // Create session
                const session = await prisma.chatSession.create({
                    data: {
                        userId: user.id,
                        visitorId: 'ADMIN',
                        visitorName: 'DomainLiq Support',
                        visitorEmail: 'support@domainliq.com',
                        domainId: null,
                    },
                });

                // Create welcome message
                await prisma.chatMessage.create({
                    data: {
                        sessionId: session.id,
                        sender: 'visitor', // Admin
                        content: 'Welcome to DomainLiq! If you have any questions, you can ask them directly here. Our support team will reply as soon as possible.',
                        read: false,
                    },
                });

                console.log(`Sent welcome message to ${user.email}`);
            } else {
                console.log(`User ${user.email} already has a support chat.`);
            }
        }

        console.log('Done!');
    } catch (error) {
        console.error('Error sending welcome messages:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
