import { ImageResponse } from 'next/og';
import { db } from '@/lib/db';

export const runtime = 'edge';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params;

        // Fetch user and their domains
        const user = await db.user.findUnique({
            where: { subdomain: username },
            include: {
                domains: {
                    where: { status: 'available' },
                    orderBy: { createdAt: 'desc' },
                    take: 6, // Show up to 6 domains
                },
            },
        });

        if (!user) {
            return new Response('User not found', { status: 404 });
        }

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        backgroundColor: '#0A0A0A',
                        padding: '60px 80px',
                    }}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ color: '#FFFFFF', fontSize: 48, fontWeight: 700 }}>
                                {user.name || username}
                            </div>
                        </div>
                        <div style={{ color: '#9CA3AF', fontSize: 28 }}>
                            Domain Liquidation Marketplace
                        </div>
                    </div>

                    {/* Domain List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                        {user.domains.length > 0 ? (
                            user.domains.map((domain: any) => (
                                <div
                                    key={domain.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        padding: '20px 30px',
                                    }}
                                >
                                    <div style={{ color: '#E5E7EB', fontSize: 32, fontWeight: 500 }}>
                                        {domain.name}
                                    </div>
                                    <div style={{ color: '#FFD700', fontSize: 32, fontWeight: 600 }}>
                                        ${domain.price.toLocaleString()}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ color: '#6B7280', fontSize: 28 }}>
                                No domains listed yet
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <div style={{ color: '#6B7280', fontSize: 24 }}>
                            domainliq.com/u/{username}
                        </div>
                        <div style={{ color: '#FFD700', fontSize: 24, fontWeight: 600 }}>
                            {user.domains.length} {user.domains.length === 1 ? 'domain' : 'domains'}
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (error) {
        console.error('OG Image generation error:', error);
        return new Response('Failed to generate image', { status: 500 });
    }
}
