

import { db } from '../lib/db';

async function testQuery() {
    console.log('Testing Prisma Query...');
    const email = 'test@test.com';
    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
        console.log('User not found');
        return;
    }

    try {
        const sessions = await db.chatSession.findMany({
            where: {
                OR: [
                    { userId: user.id },
                    {
                        domain: {
                            userId: user.id,
                        },
                    },
                ],
            },
            include: {
                domain: {
                    select: {
                        name: true,
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                sender: 'visitor',
                                read: false,
                            },
                        },
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        console.log('Query successful. Sessions found:', sessions.length);
        console.log(JSON.stringify(sessions, null, 2));
    } catch (e: any) {
        console.error('Query FAILED:', e);
    }
}

testQuery();
