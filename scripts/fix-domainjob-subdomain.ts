
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fixing subdomain for "domainjob.com"...');

    try {
        // Find the user with the incorrect subdomain
        const user = await prisma.user.findFirst({
            where: {
                subdomain: 'domainjob.com'
            }
        });

        if (!user) {
            console.log('User with subdomain "domainjob.com" not found.');
            return;
        }

        console.log(`Found user: ${user.email} (ID: ${user.id})`);

        // Update the subdomain to remove .com
        const updatedUser = await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                subdomain: 'domainjob'
            }
        });

        console.log(`Successfully updated subdomain to: ${updatedUser.subdomain}`);

    } catch (error) {
        console.error('Error fixing subdomain:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
