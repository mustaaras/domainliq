import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { domain } = await req.json();

        if (!domain) {
            return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
        }

        // Get Coolify configuration from environment
        const coolifyUrl = process.env.COOLIFY_URL || 'http://localhost';
        const coolifyToken = process.env.COOLIFY_API_TOKEN;
        const applicationId = process.env.COOLIFY_APPLICATION_ID;

        if (!coolifyToken || !applicationId) {
            console.error('[Coolify] Missing API token or Application ID');
            return NextResponse.json(
                { error: 'Coolify not configured' },
                { status: 500 }
            );
        }

        console.log(`[Coolify] Adding domain: ${domain}`);

        // Add domain to Coolify via API
        const response = await fetch(
            `${coolifyUrl}/api/v1/applications/${applicationId}/domains`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${coolifyToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    domain: `https://${domain}`,
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Coolify] Failed to add domain: ${errorText}`);
            return NextResponse.json(
                { error: 'Failed to register domain with Coolify', details: errorText },
                { status: response.status }
            );
        }

        const result = await response.json();
        console.log(`[Coolify] Domain added successfully: ${domain}`);

        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        console.error('[Coolify] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
