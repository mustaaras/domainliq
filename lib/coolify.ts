import { headers } from 'next/headers';

const COOLIFY_API_URL = process.env.COOLIFY_API_URL || 'https://app.coolify.io/api/v1';
const COOLIFY_API_TOKEN = process.env.COOLIFY_API_TOKEN;
const COOLIFY_APP_UUID = process.env.COOLIFY_APPLICATION_ID; // User uses COOLIFY_APPLICATION_ID

/**
 * Adds a custom domain to the Coolify Application.
 * This preserves existing domains and appends the new one.
 */
export async function addCustomDomainToCoolify(newDomain: string) {
    if (!COOLIFY_API_TOKEN || !COOLIFY_APP_UUID) {
        console.error('Coolify API configuration missing');
        return { success: false, error: 'Configuration missing' };
    }

    // 1. Clean the domain (remove protocol, trailing slash)
    const cleanDomain = newDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const fullUrl = `https://${cleanDomain}`;

    try {
        // 2. Get current configuration to find existing domains
        const getResponse = await fetch(`${COOLIFY_API_URL}/applications/${COOLIFY_APP_UUID}`, {
            headers: {
                'Authorization': `Bearer ${COOLIFY_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        if (!getResponse.ok) {
            throw new Error(`Failed to fetch app: ${getResponse.statusText}`);
        }

        const appData = await getResponse.json();
        const currentDomains = appData.fqdn || '';

        console.log('[Coolify] Current Domains:', currentDomains);

        // 3. Check if domain already exists
        if (currentDomains.includes(fullUrl)) {
            console.log('[Coolify] Domain already exists, skipping update.');
            return { success: true, message: 'Domain already exists' };
        }

        // 4. Append new domain (comma separated)
        // Handle empty currentDomains correctly
        const newFqdn = currentDomains ? `${currentDomains},${fullUrl}` : fullUrl;

        console.log('[Coolify] Sending Update with FQDN:', newFqdn);

        // 5. Update the application
        const updateResponse = await fetch(`${COOLIFY_API_URL}/applications/${COOLIFY_APP_UUID}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${COOLIFY_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fqdn: newFqdn,
            }),
        });

        if (!updateResponse.ok) {
            throw new Error(`Failed to update domains: ${updateResponse.statusText}`);
        }

        // 6. Trigger a redeploy (optional, but usually needed for Traefik to pick it up)
        // For just updating domains, sometimes a restart is enough, but redeploy is safer.
        // You might want to make this a separate step or let the user trigger it.
        await fetch(`${COOLIFY_API_URL}/deploy?uuid=${COOLIFY_APP_UUID}&force=false`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${COOLIFY_API_TOKEN}`,
            },
        });

        return { success: true, message: 'Domain added and deployment triggered' };

    } catch (error) {
        console.error('Error adding domain to Coolify:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
