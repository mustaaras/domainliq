'use server';

import whois from 'whois-json';

export async function lookupWhois(domain: string) {
    if (!domain) {
        return { error: 'Domain is required' };
    }

    // Basic validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
        return { error: 'Invalid domain format' };
    }

    try {
        const result = await whois(domain);
        return { data: result };
    } catch (error) {
        console.error('WHOIS Lookup Error:', error);
        return { error: 'Failed to fetch WHOIS data' };
    }
}
