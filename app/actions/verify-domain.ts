'use server';

import { db } from '@/lib/db';
import { resolveTxt } from 'dns/promises';

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
                console.error('DoH lookup failed, falling back to system DNS:', dohError);
            }

            // If DoH didn't find it, try system DNS
            if (txtRecords.length === 0) {
                const records = await resolveTxt(domain.name);
                txtRecords = records;
            }

            const flatRecords = txtRecords.flat();

            // 3. Check for token match
            const isMatch = flatRecords.some((r) => r.includes(domain.verificationToken!));

            if (isMatch) {
                // 4. Update DB
                await db.domain.update({
                    where: { id: domainId },
                    data: {
                        isVerified: true,
                        verifiedAt: new Date(),
                    },
                });

                return { success: true };
            }

            return { error: 'TXT record not found. Please ensure you have added the correct record and wait a few minutes for DNS propagation.' };
        } catch (err) {
            console.error('DNS lookup failed:', err);
            return { error: 'Could not read DNS records. Please check the domain name and try again.' };
        }
    } catch (error) {
        console.error('Verification error:', error);
        return { error: 'Internal server error during verification.' };
    }
}
