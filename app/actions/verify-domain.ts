'use server';

import { db } from '@/lib/db';
import { resolveTxt, resolveNs } from 'dns/promises';

export async function verifyDomain(domainId: string) {
    try {
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
            // 2. Query DNS using Cloudflare DNS-over-HTTPS for faster propagation check
            // Fallback to system DNS if DoH fails
            let txtRecords: string[][] = [];
            let nsRecords: string[] = [];

            // --- TXT Record Check ---
            // Expected format: domainliq-verification=[userToken]
            const expectedTxtRecord = `domainliq-verification=${userToken}`;

            try {
                const dohResponse = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain.name}&type=TXT`, {
                    headers: { 'Accept': 'application/dns-json' },
                    cache: 'no-store'
                });

                if (dohResponse.ok) {
                    const data = await dohResponse.json();
                    if (data.Answer) {
                        txtRecords = data.Answer
                            .filter((record: any) => record.type === 16) // 16 is TXT
                            .map((record: any) => [record.data.replace(/^"|"$/g, '')]); // Remove quotes
                    }
                }
            } catch (dohError) {
                console.error('DoH TXT lookup failed, falling back to system DNS:', dohError);
            }

            // If DoH didn't find it, try system DNS
            if (txtRecords.length === 0) {
                try {
                    const records = await resolveTxt(domain.name);
                    txtRecords = records;
                } catch (e) {
                    // Ignore error if TXT lookup fails, we'll try NS
                }
            }

            const flatTxtRecords = txtRecords.flat();
            const isTxtMatch = flatTxtRecords.some((r) => r.includes(expectedTxtRecord));

            if (isTxtMatch) {
                await markAsVerified(domainId);
                return { success: true };
            }

            // --- NS Record Check ---
            // Expected format: ns1.domainliq.com or ns2.domainliq.com
            const expectedNsRecords = ['ns1.domainliq.com', 'ns2.domainliq.com'];

            try {
                const dohResponse = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain.name}&type=NS`, {
                    headers: { 'Accept': 'application/dns-json' },
                    cache: 'no-store'
                });

                if (dohResponse.ok) {
                    const data = await dohResponse.json();
                    if (data.Answer) {
                        nsRecords = data.Answer
                            .filter((record: any) => record.type === 2) // 2 is NS
                            .map((record: any) => record.data);
                    }
                }
            } catch (dohError) {
                console.error('DoH NS lookup failed, falling back to system DNS:', dohError);
            }

            if (nsRecords.length === 0) {
                try {
                    const records = await resolveNs(domain.name);
                    nsRecords = records;
                } catch (e) {
                    // Ignore error
                }
            }

            // Check if any of the domain's NS records match our expected NS records
            // We check for partial match because NS records might have trailing dot
            const isNsMatch = nsRecords.some(record => {
                const cleanRecord = record.replace(/\.$/, '').toLowerCase();
                return expectedNsRecords.includes(cleanRecord);
            });

            if (isNsMatch) {
                await markAsVerified(domainId);
                return { success: true };
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

async function markAsVerified(domainId: string) {
    await db.domain.update({
        where: { id: domainId },
        data: {
            isVerified: true,
            verifiedAt: new Date(),
        },
    });
}
