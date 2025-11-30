'use server';

import { db } from '@/lib/db';

export async function verifyDomain(domainId: string) {
    try {
        // Dynamic imports to avoid client-side bundling issues
        const { resolveTxt, resolveNs } = await import('dns/promises');

        // 1. Get the domain and user token from DB
        const domain = await db.domain.findUnique({
            where: { id: domainId }
        });

        if (!domain) {
            return { error: 'Domain not found' };
        }

        if (domain.isVerified) {
            return { success: true, message: 'Domain is already verified' };
        }

        // Get the user to access their verification token
        const user = await db.user.findUnique({
            where: { id: domain.userId },
            select: { verificationToken: true }
        });

        if (!user?.verificationToken) {
            return { error: 'Verification token missing. Please refresh the page to generate one.' };
        }

        const userToken = user.verificationToken;

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

            // 3. Fallback: Check Authoritative Nameservers directly
            // This bypasses propagation delays by querying the TLD's nameservers (e.g., a0.nic.bet)
            try {
                console.log('🌐 Trying authoritative NS check for', domain.name);
                const authMatch = await checkAuthoritative(domain.name, expectedNsRecord, resolveNs);
                console.log('📡 Authoritative check result:', authMatch);
                if (authMatch) {
                    await markAsVerified(domainId);
                    return { success: true };
                }
            } catch (authError) {
                console.error('Authoritative check failed:', authError);
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

async function checkAuthoritative(domain: string, expectedNs: string, resolveNs: any): Promise<boolean> {
    try {
        // 1. Get TLD
        const parts = domain.split('.');
        if (parts.length < 2) return false;
        const tld = parts[parts.length - 1];

        // 2. Get TLD Nameservers
        const tldNs = await resolveNs(tld);
        if (!tldNs || tldNs.length === 0) return false;

        // 3. Query ALL TLD nameservers in parallel for speed
        const dns = await import('dns');
        const { resolve4 } = dns.promises;

        const queries = tldNs.map(async (targetNsHostname: string) => {
            try {
                const packet = await import('dns-packet');
                const dgram = await import('dgram');

                // Resolve the TLD NS hostname to an IP
                const nsIps = await resolve4(targetNsHostname);
                if (!nsIps || nsIps.length === 0) return false;

                const nsIp = nsIps[0];

                // Create DNS query packet
                const query = packet.encode({
                    type: 'query',
                    id: Math.floor(Math.random() * 65535),
                    flags: packet.RECURSION_DESIRED,
                    questions: [{
                        type: 'NS',
                        name: domain
                    }]
                });

                // Send query via UDP
                return new Promise<boolean>((resolve) => {
                    const socket = dgram.createSocket('udp4');
                    const timeout = setTimeout(() => {
                        socket.close();
                        resolve(false);
                    }, 3000); // Reduced timeout for faster parallel queries

                    socket.on('message', (message: Buffer) => {
                        clearTimeout(timeout);
                        socket.close();

                        try {
                            const response = packet.decode(message);

                            // Check both ANSWER and AUTHORITY sections
                            const allRecords = [
                                ...(response.answers || []),
                                ...(response.authorities || [])
                            ];

                            const nsRecords = allRecords.filter((r: any) => r.type === 'NS');

                            const normalizedExpected = expectedNs.toLowerCase().replace(/\.$/, '');

                            const match = nsRecords.some((record: any) => {
                                const cleanRecord = (record.data || '').toLowerCase().replace(/\.$/, '');
                                return cleanRecord === normalizedExpected;
                            });

                            resolve(match);
                        } catch (e) {
                            resolve(false);
                        }
                    });

                    socket.on('error', () => {
                        clearTimeout(timeout);
                        socket.close();
                        resolve(false);
                    });

                    socket.send(query, 53, nsIp);
                });
            } catch (e) {
                return false;
            }
        });

        // Return true as soon as ANY server confirms the record
        const results = await Promise.all(queries);
        const finalResult = results.some(result => result === true);
        return finalResult;
    } catch (e) {
        console.error('Authoritative check error:', e);
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
