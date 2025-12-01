import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const topSellers = await db.user.findMany({
            where: {
                domains: {
                    some: {
                        status: 'available'
                    }
                }
            },
            select: {
                id: true,
                name: true,
                subdomain: true,
                _count: {
                    select: {
                        domains: {
                            where: {
                                status: 'available'
                            }
                        }
                    }
                }
            },
            orderBy: {
                domains: {
                    _count: 'desc'
                }
            },
            take: 10
        });

        const formattedSellers = topSellers.map(seller => ({
            id: seller.id,
            name: seller.name || seller.subdomain,
            subdomain: seller.subdomain,
            domainCount: seller._count.domains
        }));

        return NextResponse.json(formattedSellers);
    } catch (error) {
        console.error('Failed to fetch top sellers:', error);
        return NextResponse.json({ error: 'Failed to fetch top sellers' }, { status: 500 });
    }
}
