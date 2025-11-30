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
                    take: 7, // Show up to 7 domains
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
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#050505',
                        padding: '40px',
                    }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '40px',
                        width: '100%'
                    }}>
                        <div style={{ color: '#FFFFFF', fontSize: 32, fontWeight: 600, opacity: 0.5 }}>
                            {user.name || username}'s Premium Domains
                        </div>
                    </div>

                    {/* Domain List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center' }}>
                        {user.domains.length > 0 ? (
                            user.domains.map((domain: any) => (
                                <div
                                    key={domain.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        width: '90%',
                                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '16px',
                                        padding: '16px 40px',
                                    }}
                                >
                                    <div style={{ color: '#FFFFFF', fontSize: 42, fontWeight: 700, letterSpacing: '-0.02em' }}>
                                        {domain.name}
                                    </div>
                                    <div style={{ color: '#F59E0B', fontSize: 42, fontWeight: 600 }}>
                                        ${domain.price.toLocaleString()}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ color: '#6B7280', fontSize: 32 }}>
                                No domains listed yet
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        position: 'absolute',
                        bottom: '30px',
                        color: '#4B5563',
                        fontSize: 20,
                        fontWeight: 500
                    }}>
                        domainliq.com/u/{username}
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
