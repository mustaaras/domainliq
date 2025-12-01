import { ImageResponse } from 'next/og';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

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
                    take: 8, // Show up to 8 domains
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
                    {/* Domain List - ONLY domains, no header/footer */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center' }}>
                        {user.domains.length > 0 ? (
                            user.domains.map((domain: any) => (
                                <div
                                    key={domain.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        width: '100%',
                                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '16px',
                                        padding: '12px 40px',
                                    }}
                                >
                                    <div style={{ color: '#FFFFFF', fontSize: 46, fontWeight: 700, letterSpacing: '-0.02em' }}>
                                        {domain.name}
                                    </div>
                                    <div style={{ color: '#F59E0B', fontSize: 46, fontWeight: 600 }}>
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
