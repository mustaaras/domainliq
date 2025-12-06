
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Adding "profileViews" column to User table...');
    try {
        await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profileViews" INTEGER NOT NULL DEFAULT 0;`;
        console.log('Successfully added "profileViews" column.');
    } catch (e) {
        console.error('Error adding column:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
