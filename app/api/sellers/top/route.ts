import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Get top sellers with available domain count
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

        // Get sold count for each seller (count domains with status 'sold')
        // Get sold count for all these sellers in one query
        const soldCounts = await db.domain.groupBy({
            by: ['userId'],
            where: {
                userId: { in: topSellers.map(s => s.id) },
                status: 'sold'
            },
            _count: true
        });

        // Create a map for easy lookup
        const soldMap = new Map(soldCounts.map(item => [item.userId, item._count]));

        const sellersWithSoldCount = topSellers.map(seller => ({
            id: seller.id,
            name: seller.name || seller.subdomain,
            subdomain: seller.subdomain,
            domainCount: seller._count.domains,
            soldCount: soldMap.get(seller.id) || 0
        }));

        return NextResponse.json(sellersWithSoldCount);
    } catch (error) {
        console.error('Failed to fetch top sellers:', error);
        return NextResponse.json({ error: 'Failed to fetch top sellers' }, { status: 500 });
    }
}
