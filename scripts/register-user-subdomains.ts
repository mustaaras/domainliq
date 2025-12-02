/**
 * One-time script to register all existing user subdomains with Coolify
 * Run this once after deploying the Coolify API integration
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const COOLIFY_URL = process.env.COOLIFY_URL || 'http://localhost';
const COOLIFY_TOKEN = process.env.COOLIFY_API_TOKEN;
const APPLICATION_ID = process.env.COOLIFY_APPLICATION_ID;

async function registerSubdomain(subdomain: string) {
    const domain = `${subdomain}.domainliq.com`;

    console.log(`Registering: ${domain}`);

    try {
        const response = await fetch(
            `${COOLIFY_URL}/api/v1/applications/${APPLICATION_ID}/domains`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${COOLIFY_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    domain: `https://${domain}`,
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Failed: ${domain} - ${errorText}`);
            return false;
        }

        console.log(`✅ Success: ${domain}`);
        return true;
    } catch (error) {
        console.error(`❌ Error: ${domain}`, error);
        return false;
    }
}

async function main() {
    if (!COOLIFY_TOKEN || !APPLICATION_ID) {
        console.error('Missing COOLIFY_API_TOKEN or COOLIFY_APPLICATION_ID');
        process.exit(1);
    }

    console.log('Fetching all users with subdomains...');

    const users = await db.user.findMany({
        where: {
            subdomain: {
                not: undefined,
            },
        },
        select: {
            subdomain: true,
            email: true,
        },
    });
});

console.log(`Found ${users.length} users with subdomains\n`);

let successCount = 0;
let failCount = 0;

for (const user of users) {
    if (user.subdomain) {
        const success = await registerSubdomain(user.subdomain);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

console.log(`\n✅ Successfully registered: ${successCount}`);
console.log(`❌ Failed: ${failCount}`);

await db.$disconnect();
}

main().catch(console.error);
