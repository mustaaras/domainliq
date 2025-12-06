
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const domain = await prisma.domain.findFirst({
        where: { name: 'techstartup.com' },
        select: { name: true, views: true }
    });

    const user = await prisma.user.findUnique({
        where: { subdomain: 'john' },
        select: { subdomain: true, profileViews: true }
    });

    console.log('Stats Check:', { domain, user });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
