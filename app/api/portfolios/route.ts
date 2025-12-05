import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const page = parseInt(searchParams.get('page') || '1');
        const offset = (page - 1) * limit;

        // Fallback for stale db instance in dev
        const prisma = (db as any).portfolio ? db : new PrismaClient();

        // Fetch public portfolios (verified only? or all? The homepage shows all generally)
        // The previous implementation likely fetched all portfolios or verified ones.
        // Based on earlier conversations, we removed the verified filter.

        const [portfolios, total] = await Promise.all([
            (prisma as any).portfolio.findMany({
                take: limit,
                skip: offset,
                include: {
                    domains: {
                        select: {
                            id: true,
                            name: true,
                            isVerified: true,
                        },
                    },
                    user: {
                        select: {
                            name: true,
                            subdomain: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            (prisma as any).portfolio.count(),
        ]);

        return NextResponse.json({
            portfolios,
            pagination: {
                page,
                pages: Math.ceil(total / limit),
                total,
            },
        });
    } catch (error: any) {
        console.error('Error fetching portfolios:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
