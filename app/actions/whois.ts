'use server';

import whois from 'whois-json';

import { headers } from 'next/headers';

// Simple in-memory rate limiter
// Map<IP, timestamp[]>
const rateLimitMap = new Map<string, number[]>();
const globalRequestTimestamps: number[] = [];

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_IP = 5;
const MAX_GLOBAL_REQUESTS = 60; // Safe limit for standard TLDs

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();

    // Cleanup IP map
    for (const [ip, timestamps] of rateLimitMap.entries()) {
        const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
        if (validTimestamps.length === 0) {
            rateLimitMap.delete(ip);
        } else {
            rateLimitMap.set(ip, validTimestamps);
        }
    }

    // Cleanup global timestamps
    const validGlobal = globalRequestTimestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
    // Mutate array to keep reference if used elsewhere, but here reassignment is safe inside logic if scoped correctly. 
    // Actually, let's splice to clean.
    const removeCount = globalRequestTimestamps.length - validGlobal.length;
    if (removeCount > 0) {
        globalRequestTimestamps.splice(0, removeCount);
    }
}, 5 * 60 * 1000);

function checkRateLimit(ip: string): { allowed: boolean; error?: string } {
    const now = Date.now();

    // 1. Check Global Limit
    const validGlobal = globalRequestTimestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
    if (validGlobal.length >= MAX_GLOBAL_REQUESTS) {
        return { allowed: false, error: 'System busy. Please try again later.' };
    }

    // 2. Check IP Limit
    const timestamps = rateLimitMap.get(ip) || [];
    const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);

    if (validTimestamps.length >= MAX_REQUESTS_PER_IP) {
        return { allowed: false, error: 'Too many requests. Please try again in a minute.' };
    }

    // Update State
    globalRequestTimestamps.push(now);
    validTimestamps.push(now);
    rateLimitMap.set(ip, validTimestamps);

    return { allowed: true };
}

export async function lookupWhois(domain: string) {
    if (!domain) {
        return { error: 'Domain is required' };
    }

    // Rate Limiting
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';

    // Skip rate limit for localhost dev
    if (ip !== 'unknown' && ip !== '::1' && ip !== '127.0.0.1') {
        const limitCheck = checkRateLimit(ip);
        if (!limitCheck.allowed) {
            return { error: limitCheck.error };
        }
    }

    // Strict Domain Validation (Security)
    const domainRegex = /^(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$/;
    const dangerousChars = /[;&|`$(){}[\]<>\\'"!\n\r\t]/;

    if (!domain || domain.length > 253) {
        return { error: 'Invalid domain length' };
    }
    if (dangerousChars.test(domain)) {
        console.error(`[SECURITY] Blocked malicious WHOIS input: ${domain}`);
        return { error: 'Invalid characters in domain' };
    }
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
