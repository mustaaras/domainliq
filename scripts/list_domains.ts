
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const domains = await prisma.domain.findMany({
        select: { name: true, views: true }
    });
    console.log('Existing domains:', domains);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
