import { db } from '@/lib/db';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user's domains with views
        const domains = await db.domain.findMany({
            where: { userId: session.user.id },
            select: {
                id: true,
                name: true,
                views: true,
                isVerified: true,
                updatedAt: true,
            },
            orderBy: { views: 'desc' },
            take: 20 // Top 20 for the list
        });

        // Fetch user stats
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: { profileViews: true }
        });

        // Calculate aggregates
        const totalViews = domains.reduce((sum, d) => sum + d.views, 0) + (user?.profileViews || 0);
        const totalDomains = await db.domain.count({ where: { userId: session.user.id } });

        // Mock data for "Visitors" since we only track page views right now
        // In a real app, we'd track unique IPs or sessions
        const totalVisitors = Math.round(totalViews * 0.8);

        return NextResponse.json({
            overview: {
                totalViews,
                totalVisitors,
                totalDomains
            },
            topDomains: domains
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
