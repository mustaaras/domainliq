'use server';

import { db } from '@/lib/db';
import { resolveTxt, resolveNs } from 'dns/promises';

export async function verifyDomain(domainId: string) {
    try {
        // 1. Get the domain and token from DB
        const domain = await db.domain.findUnique({
            where: { id: domainId },
            select: {
                id: true,
                name: true,
                verificationToken: true,
                isVerified: true,
            },
        });

        if (!domain) {
            return { error: 'Domain not found' };
        }

        if (domain.isVerified) {
            return { success: true, message: 'Domain is already verified' };
        }

        if (!domain.verificationToken) {
            return { error: 'Verification token missing. Please contact support.' };
        }

        try {
            // 2. Query DNS using Cloudflare DNS-over-HTTPS for faster propagation check
            // Fallback to system DNS if DoH fails
            let txtRecords: string[][] = [];
            let nsRecords: string[] = [];

            // --- TXT Record Check ---
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
            const isTxtMatch = flatTxtRecords.some((r) => r.includes(domain.verificationToken!));

            if (isTxtMatch) {
                await markAsVerified(domainId);
                return { success: true };
            }

            // --- NS Record Check ---
            // Expected format: verify-[token].ns.domainliq.com
            const expectedNsRecord = `verify-${domain.verificationToken}.ns.domainliq.com`;

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

            const isNsMatch = nsRecords.some(r => r === expectedNsRecord || r === expectedNsRecord + '.');

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
