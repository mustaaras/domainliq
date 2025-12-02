import dns from 'dns/promises';

export interface VerificationResult {
    verified: boolean;
    method?: 'txt' | 'a' | 'ns';
    pointsToServer?: boolean;
    error?: string;
}

const SERVER_IP = process.env.SERVER_IP || '46.224.108.38';

/**
 * Verify domain ownership via DNS records
 * Checks TXT, A, and NS records for verification
 */
export async function verifyDomainOwnership(
    domain: string,
    expectedToken: string
): Promise<VerificationResult> {
    try {
        // Remove trailing dot if present
        const cleanDomain = domain.replace(/\.$/, '');

        // Method 1: Check TXT record
        try {
            const txtRecords = await dns.resolveTxt(`_domainliq-verification.${cleanDomain}`);
            const flatRecords = txtRecords.flat();

            if (flatRecords.includes(expectedToken)) {
                // Also check if domain points to our server
                const pointsToServer = await checkARecord(cleanDomain);
                return {
                    verified: true,
                    method: 'txt',
                    pointsToServer,
                };
            }
        } catch (error) {
            // TXT record not found or invalid, continue to next method
        }

        // Method 2: Check A record
        try {
            const aRecords = await dns.resolve4(cleanDomain);
            const pointsToServer = aRecords.includes(SERVER_IP);

            if (pointsToServer) {
                return {
                    verified: true,
                    method: 'a',
                    pointsToServer: true,
                };
            }
        } catch (error) {
            // A record not found or invalid, continue to next method
        }

        // Method 3: Check NS record for ns3verify subdomain
        try {
            const nsRecords = await dns.resolveNs(`ns3verify.${cleanDomain}`);
            const hasDomainLiqNS = nsRecords.some(ns =>
                ns.toLowerCase().includes('domainliq.com')
            );

            if (hasDomainLiqNS) {
                // Check if main domain also points to our server
                const pointsToServer = await checkARecord(cleanDomain);
                return {
                    verified: true,
                    method: 'ns',
                    pointsToServer,
                };
            }
        } catch (error) {
            // NS record not found or invalid
        }

        return {
            verified: false,
            error: 'No valid verification method found. Please add TXT, A, or NS record.',
        };
    } catch (error: any) {
        return {
            verified: false,
            error: `DNS lookup failed: ${error.message}`,
        };
    }
}

/**
 * Check if domain's A record points to our server
 */
async function checkARecord(domain: string): Promise<boolean> {
    try {
        const aRecords = await dns.resolve4(domain);
        return aRecords.includes(SERVER_IP);
    } catch (error) {
        return false;
    }
}

/**
 * Get verification instructions for a domain
 */
export function getVerificationInstructions(domain: string, token: string) {
    return {
        domain,
        token,
        methods: [
            {
                name: 'TXT Record (Recommended)',
                type: 'TXT',
                host: `_domainliq-verification.${domain}`,
                value: token,
                description: 'Add this TXT record to your DNS settings',
            },
            {
                name: 'A Record',
                type: 'A',
                host: '@',
                value: SERVER_IP,
                description: 'Point your domain to our server (also enables lander)',
            },
            {
                name: 'NS Record',
                type: 'NS',
                host: `ns3verify.${domain}`,
                value: 'domainliq.com',
                description: 'Add this NS record for verification',
            },
        ],
    };
}
