
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Adding "views" column to Domain table...');
    try {
        await prisma.$executeRaw`ALTER TABLE "Domain" ADD COLUMN IF NOT EXISTS "views" INTEGER NOT NULL DEFAULT 0;`;
        console.log('Successfully added "views" column.');
    } catch (e) {
        console.error('Error adding column:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
