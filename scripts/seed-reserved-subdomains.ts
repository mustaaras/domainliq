import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const reservedSubdomains = [
    'ns2', 'ns3verify', 'my', '1', 'blog', 'a', 'ns3', 'ns4', 'ns5', 'ns6', 'ns7', 'ns8',
    'home', 'app', 'info', 'verify', 'oauth', 'contact', 'support', 'mail', 'noreply', 'no-reply'
];

async function main() {
    console.log('Start seeding reserved subdomains...');

    for (const name of reservedSubdomains) {
        try {
            await prisma.reservedSubdomain.upsert({
                where: { name },
                update: {},
                create: { name },
            });
            console.log(`Reserved: ${name}`);
        } catch (error) {
            console.error(`Error reserving ${name}:`, error);
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
