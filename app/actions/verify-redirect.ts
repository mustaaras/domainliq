'use server';

import { db } from '@/lib/db';

export async function verifyRedirect(domainId: string) {
    try {
        const domain = await db.domain.findUnique({
            where: { id: domainId }
        });

        if (!domain) {
            return { error: 'Domain not found' };
        }

        const targetUrl = `https://domainliq.com/d/${domain.name}`;
        const httpUrl = `http://${domain.name}`;
        const httpsUrl = `https://${domain.name}`;

        // Check HTTP first
        try {
            const res = await fetch(httpUrl, {
                method: 'HEAD',
                redirect: 'manual' // Don't follow redirects automatically
            });

            if (res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308) {
                const location = res.headers.get('location');
                if (location && (location === targetUrl || location === targetUrl + '/')) {
                    await markAsVerified(domainId, domain.name, 'redirect');
                    return { success: true };
                }
            }
        } catch (e) {
            console.log('HTTP check failed:', e);
        }

        // Check HTTPS
        try {
            const res = await fetch(httpsUrl, {
                method: 'HEAD',
                redirect: 'manual'
            });

            if (res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308) {
                const location = res.headers.get('location');
                if (location && (location === targetUrl || location === targetUrl + '/')) {
                    await markAsVerified(domainId, domain.name, 'redirect');
                    return { success: true };
                }
            }
        } catch (e) {
            console.log('HTTPS check failed:', e);
        }

        return { error: 'Redirect not found. Please ensure you have set up a 301 redirect to ' + targetUrl };

    } catch (error) {
        console.error('Verification error:', error);
        return { error: 'Internal server error during verification.' };
    }
}

async function markAsVerified(domainId: string, domainName: string, method: string) {
    await db.domain.update({
        where: { id: domainId },
        data: {
            isVerified: true,
            verifiedAt: new Date(),
            verificationMethod: method
        },
    });
    console.log(`ℹ️ [Verification] Domain ${domainName} verified via ${method.toUpperCase()}`);
}
