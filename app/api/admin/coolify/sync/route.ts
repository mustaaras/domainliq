import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

const COOLIFY_API_URL = process.env.COOLIFY_API_URL || 'https://app.coolify.io/api/v1';
const COOLIFY_API_TOKEN = process.env.COOLIFY_API_TOKEN;
const COOLIFY_APP_UUID = process.env.COOLIFY_APPLICATION_ID;

// Support both GET and POST for convenience
export async function GET() {
    return syncDomains();
}

export async function POST() {
    return syncDomains();
}

async function syncDomains() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!COOLIFY_API_TOKEN || !COOLIFY_APP_UUID) {
            return NextResponse.json({ error: 'Coolify configuration missing' }, { status: 500 });
        }

        // 1. Get all verified domains
        const verifiedDomains = await db.domain.findMany({
            where: { isVerified: true },
            select: { name: true }
        });

        // 2. Get current Coolify app config
        const getResponse = await fetch(`${COOLIFY_API_URL}/applications/${COOLIFY_APP_UUID}`, {
            headers: {
                'Authorization': `Bearer ${COOLIFY_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        if (!getResponse.ok) {
            return NextResponse.json({
                error: `Failed to fetch app: ${getResponse.statusText}`
            }, { status: 500 });
        }

        const appData = await getResponse.json();
        const currentFqdn = appData.fqdn || '';

        // 3. Build new FQDN list (preserving existing + adding new)
        const existingDomains = new Set(currentFqdn.split(',').map((d: string) => d.trim()).filter(Boolean));
        let added = 0;

        for (const domain of verifiedDomains) {
            const fullUrl = `https://${domain.name}`;
            if (!existingDomains.has(fullUrl)) {
                existingDomains.add(fullUrl);
                added++;
            }
        }

        const newFqdn = Array.from(existingDomains).join(',');

        // 4. Update in ONE API call
        const updateResponse = await fetch(`${COOLIFY_API_URL}/applications/${COOLIFY_APP_UUID}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${COOLIFY_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fqdn: newFqdn }),
        });

        if (!updateResponse.ok) {
            return NextResponse.json({
                error: `Failed to update: ${updateResponse.statusText}`
            }, { status: 500 });
        }

        // 5. Trigger redeploy
        await fetch(`${COOLIFY_API_URL}/deploy?uuid=${COOLIFY_APP_UUID}&force=false`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${COOLIFY_API_TOKEN}` },
        });

        return NextResponse.json({
            message: 'Sync complete',
            totalVerified: verifiedDomains.length,
            newlyAdded: added,
            totalDomains: existingDomains.size,
        });

    } catch (error) {
        console.error('Sync error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
