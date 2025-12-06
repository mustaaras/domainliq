
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const domain = await prisma.domain.findFirst({
        where: { name: 'zup1.com' },
        select: { name: true, views: true }
    });
    console.log('Domain Stats:', domain);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
