
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSessions() {
    console.log('Checking sessions...');
    const email = 'test@test.com'; // Testing the user's account

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.log(`User ${email} not found`);
        return;
    }
    console.log('User ID:', user.id);

    const sessions = await prisma.chatSession.findMany({
        where: {
            OR: [
                { userId: user.id },
                { domain: { userId: user.id } } // Check the inclusive query logic
            ]
        },
        include: {
            domain: true,
            user: true
        }
    });

    console.log(`Found ${sessions.length} sessions.`);
    sessions.forEach(s => {
        console.log(`- Session ${s.id}: userId=${s.userId}, domainId=${s.domainId}, visitorId=${s.visitorId}`);
    });
}

checkSessions();
