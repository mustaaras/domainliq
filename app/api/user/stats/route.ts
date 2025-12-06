import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    console.log('[Stats API] Request received');
    const session = await auth(); // Remove req arg, let NextAuth handle retrieval using next/headers
    console.log('[Stats API] Session:', session?.user?.email);

    if (!session || !session.user) {
        console.log('[Stats API] Unauthorized');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'all'; // 24h, 7d, 30d, all
    console.log(`[Stats API] Fetching stats for user ${session.user.id}, range: ${range}`);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Calculate date filter
    let dateFilter: any = {};
    const now = new Date();
    if (range === '24h') {
        dateFilter = { createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } };
    } else if (range === '7d') {
        dateFilter = { createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (range === '30d') {
        dateFilter = { createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
    }

    try {
        let domains;
        let totalDomainsParams: any = { where: { userId: session.user.id } };

        if (range === 'all') {
            domains = await db.domain.findMany({
                where: { userId: session.user.id },
                orderBy: { views: 'desc' },
                take: limit,
                skip: skip,
                select: { id: true, name: true, views: true, isVerified: true, updatedAt: true }
            });
        } else {
            // For filtered ranges, we need to count events.
            const allDomains = await db.domain.findMany({
                where: { userId: session.user.id },
                select: {
                    id: true,
                    name: true,
                    isVerified: true,
                    updatedAt: true,
                    _count: {
                        select: { viewEvents: { where: dateFilter } }
                    }
                }
            });

            // Map to standard format and sort
            const mapped = allDomains.map(d => ({
                ...d,
                views: d._count.viewEvents
            })).sort((a, b) => b.views - a.views);

            domains = mapped.slice(skip, skip + limit);
        }

        const totalDomains = await db.domain.count(totalDomainsParams);


        // 2. Chart Data & Totals
        // Fetch Profile Views in range
        const profileViewsCount = await db.profileView.count({
            where: {
                userId: session.user.id,
                ...dateFilter
            }
        });

        // Fetch Domain Views in range (aggregate)
        const domainViews = await db.domainView.findMany({
            where: {
                domain: { userId: session.user.id },
                ...dateFilter
            },
            select: { createdAt: true }
        });

        const domainViewsCount = domainViews.length;

        // Note: totalViews here depends on range. 
        // If range is 'all', we might want to use the main counters for speed and accuracy (if historical data is missing).
        // But the user requested "daily, weekly" charts.
        // For consistency:
        // If 'all', use the main aggregated counters (which might be higher if we started tracking events late).
        // If filtered, use the event sums.

        let totalViews = 0;
        if (range === 'all') {
            // Use fast aggregated counters
            const user = await db.user.findUnique({
                where: { id: session.user.id },
                select: { profileViews: true, domains: { select: { views: true } } }
            });
            const totalDomainViews = user?.domains.reduce((acc, d) => acc + d.views, 0) || 0;
            totalViews = totalDomainViews + (user?.profileViews || 0);
        } else {
            totalViews = profileViewsCount + domainViewsCount;
        }

        // Generate Chart Data
        const chartDataMap = new Map<string, number>();

        const addToChart = (date: Date) => {
            let key = '';
            if (range === '24h') {
                // Hour: HH:00
                key = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            } else {
                // Date: YYYY-MM-DD
                key = date.toISOString().split('T')[0];
            }
            chartDataMap.set(key, (chartDataMap.get(key) || 0) + 1);
        };

        domainViews.forEach(v => addToChart(v.createdAt));

        const profileViewEvents = await db.profileView.findMany({
            where: {
                userId: session.user.id,
                ...dateFilter
            },
            select: { createdAt: true }
        });
        profileViewEvents.forEach(v => addToChart(v.createdAt));

        const chartData = Array.from(chartDataMap.entries())
            .map(([date, views]) => ({ date, views }))
            .sort((a, b) => a.date.localeCompare(b.date));


        return NextResponse.json({
            overview: {
                totalViews,
                totalVisitors: Math.floor(totalViews * 0.8), // Mock
                totalDomains
            },
            topDomains: domains,
            chartData,
            totalPages: Math.ceil(totalDomains / limit)
        });

    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
