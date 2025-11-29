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
            // 2. Query DNS
            const records = await resolveTxt(domain.name);
            const flatRecords = records.flat();

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
