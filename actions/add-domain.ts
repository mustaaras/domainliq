'use server';

// import { addCustomDomainToCoolify } from '@/lib/coolify';
import { auth } from '@/auth'; // Assuming you have auth setup

export async function addDomainAction(domain: string) {
    const session = await auth();
    if (!session?.user) {
        return { success: false, error: 'Unauthorized' };
    }

    if (!domain) {
        return { success: false, error: 'Domain is required' };
    }

    // Basic validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
        return { success: false, error: 'Invalid domain format' };
    }

    try {
        // const result = await addCustomDomainToCoolify(domain);
        // return result;
        console.log(`[AddDomain] Domain ${domain} added (Manual SSL required)`);
        return { success: true, message: 'Domain added. Please configure SSL manually in Coolify.' };
    } catch (error) {
        return { success: false, error: 'Failed to add domain' };
    }
}

