'use server';

import { db } from '@/lib/db';

export async function verifyDomain(domainId: string) {
    try {
        // Dynamic imports to avoid client-side bundling issues
        const { resolveTxt, resolveNs } = await import('dns/promises');

        // 1. Get the domain and user token from DB
        const domain = await db.domain.findUnique({
            where: { id: domainId },
            include: {
                user: {
                    select: {
                        verificationToken: true
                    }
                }
            }
        });

        if (!domain) {
            return { error: 'Domain not found' };
        }

        if (domain.isVerified) {
            return { success: true, message: 'Domain is already verified' };
        }

        if (!domain.user.verificationToken) {
            return { error: 'Verification token missing. Please refresh the page to generate one.' };
        }

        const userToken = domain.user.verificationToken;

        try {
            // 2. Query DNS using multiple sources for maximum reliability
            // Sources: Cloudflare DoH, Google DoH, System DNS
            let txtRecords: Set<string> = new Set();
            let nsRecords: Set<string> = new Set();

            // --- TXT Record Check ---
            const expectedTxtRecord = `domainliq-verification=${userToken}`;

            // Parallel DoH lookups
            const [cfTxt, googleTxt] = await Promise.all([
                fetchDoh('cloudflare', domain.name, 'TXT'),
                fetchDoh('google', domain.name, 'TXT')
            ]);

            cfTxt.forEach((r: string) => txtRecords.add(r));
            googleTxt.forEach((r: string) => txtRecords.add(r));

            // System DNS fallback if DoH returns nothing
            if (txtRecords.size === 0) {
                try {
                    const records = await resolveTxt(domain.name);
                    records.flat().forEach((r: string) => txtRecords.add(r));
                } catch (e) {
                    // Ignore system DNS errors
                }
            }

            // Check TXT
            const isTxtMatch = Array.from(txtRecords).some(r => r.includes(expectedTxtRecord));
            if (isTxtMatch) {
                await markAsVerified(domainId);
                return { success: true };
            }

            // --- NS Record Check ---
            const expectedNsRecord = 'ns3verify.domainliq.com';

            // Parallel DoH lookups for NS
            const [cfNs, googleNs] = await Promise.all([
                fetchDoh('cloudflare', domain.name, 'NS'),
                fetchDoh('google', domain.name, 'NS')
            ]);

            cfNs.forEach((r: string) => nsRecords.add(r));
            googleNs.forEach((r: string) => nsRecords.add(r));

            // System DNS fallback
            if (nsRecords.size === 0) {
                try {
                    const records = await resolveNs(domain.name);
                    records.forEach((r: string) => nsRecords.add(r));
                } catch (e) {
                    // Ignore system DNS errors
                }
            }

            // Check NS via DNS/DoH
            const isNsMatch = Array.from(nsRecords).some((record: string) => {
                const cleanRecord = record.replace(/\.$/, '').toLowerCase();
                return cleanRecord === expectedNsRecord;
            });

            if (isNsMatch) {
                await markAsVerified(domainId);
                return { success: true };
            }

            // 3. Fallback: Check WHOIS
            // Sometimes WHOIS updates faster than DNS propagation
            try {
                const whoisMatch = await checkWhois(domain.name, expectedNsRecord);
                if (whoisMatch) {
                    await markAsVerified(domainId);
                    return { success: true };
                }
            } catch (whoisError) {
                console.error('WHOIS lookup failed:', whoisError);
            }

            return { error: 'Verification record not found. Please ensure you have added the correct TXT or NS record and wait a few minutes for DNS propagation.' };
        } catch (err) {
            console.error('DNS lookup failed:', err);
            return { error: 'Could not read DNS records. Please check the domain name and try again.' };
        }
    } catch (error) {
        console.error('Verification error:', error);
        return { error: 'Internal server error during verification.' };
    }
}

async function fetchDoh(provider: 'cloudflare' | 'google', name: string, type: 'TXT' | 'NS'): Promise<string[]> {
    try {
        const url = provider === 'cloudflare'
            ? `https://cloudflare-dns.com/dns-query?name=${name}&type=${type}`
            : `https://dns.google/resolve?name=${name}&type=${type}`;

        const res = await fetch(url, {
            headers: { 'Accept': 'application/dns-json' },
            cache: 'no-store'
        });

        if (res.ok) {
            const data = await res.json();
            if (data.Answer) {
                return data.Answer
                    .filter((record: any) => {
                        // Type 16 is TXT, 2 is NS
                        return (type === 'TXT' && record.type === 16) || (type === 'NS' && record.type === 2);
                    })
                    .map((record: any) => {
                        // Remove quotes for TXT
                        return type === 'TXT' ? record.data.replace(/^"|"$/g, '') : record.data;
                    });
            }
        }
    } catch (error) {
        console.error(`${provider} DoH lookup failed:`, error);
    }
    return [];
}

async function checkWhois(domain: string, expectedNs: string): Promise<boolean> {
    try {
        const lookup = (await import('whois-json')).default;
        const results: any = await lookup(domain);

        // WHOIS results structure varies wildly. We look for nameServer or nserver fields.
        // They can be strings or arrays of strings.
        const nsData = results.nameServer || results.nserver || results.NameServer || results.nameserver || results['Name Server'] || results['Name server'];

        if (!nsData) return false;

        const nsList = Array.isArray(nsData) ? nsData : [nsData];
        const normalizedExpected = expectedNs.toLowerCase();

        return nsList.some((ns: any) => {
            if (typeof ns !== 'string') return false;
            return ns.toLowerCase().includes(normalizedExpected);
        });
    } catch (e) {
        console.error('WHOIS check error:', e);
        return false;
    }
}

async function markAsVerified(domainId: string) {
    await db.domain.update({
        where: { id: domainId },
        data: {
            isVerified: true,
            verifiedAt: new Date(),
        },
    });
}
