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
        console.log('[Coolify] Full App Data:', JSON.stringify(appData, null, 2));

        // Handle Docker Compose deployments
        let currentDomains = '';
        let dockerComposeDomains: any = {};
        const isDockerCompose = !!appData.docker_compose_domains;

        if (isDockerCompose) {
            try {
                // It comes as a string from the API
                dockerComposeDomains = JSON.parse(appData.docker_compose_domains);
                // Assuming the service name is 'app' - this is standard for Coolify Next.js
                // If not found, try to find the first key
                const serviceName = Object.keys(dockerComposeDomains)[0];
                if (serviceName) {
                    currentDomains = dockerComposeDomains[serviceName].domain || '';
                    console.log(`[Coolify] Found Docker Compose domains for service '${serviceName}':`, currentDomains);
                }
            } catch (e) {
                console.error('[Coolify] Failed to parse docker_compose_domains:', e);
            }
        } else {
            currentDomains = appData.fqdn || '';
        }

        console.log('[Coolify] Current Domains:', currentDomains);

        // 3. Check if domain already exists
        if (currentDomains.includes(fullUrl)) {
            console.log('[Coolify] Domain already exists, skipping update.');
            return { success: true, message: 'Domain already exists' };
        }

        // 4. Append new domain (comma separated)
        const newDomainsList = currentDomains ? `${currentDomains},${fullUrl}` : fullUrl;

        console.log('[Coolify] Sending Update with Domains:', newDomainsList);

        // 5. Update the application
        let payload: any = {};

        if (isDockerCompose) {
            // Update the JSON structure
            const serviceName = Object.keys(dockerComposeDomains)[0] || 'app';
            if (!dockerComposeDomains[serviceName]) dockerComposeDomains[serviceName] = {};
            dockerComposeDomains[serviceName].domain = newDomainsList;

            // IMPORTANT: Send as OBJECT, not string. Coolify should handle the casting.
            payload = { docker_compose_domains: dockerComposeDomains };
        } else {
            payload = { fqdn: newDomainsList };
        }

        console.log('[Coolify] PATCH Payload:', JSON.stringify(payload, null, 2));

        const updateResponse = await fetch(`${COOLIFY_API_URL}/applications/${COOLIFY_APP_UUID}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${COOLIFY_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
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
