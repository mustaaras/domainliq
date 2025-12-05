import { db } from '@/lib/db';
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fallback for stale db instance in dev
        // Cast to any to avoid TS errors if types are stale
        const prisma = (db as any).portfolio ? db : new PrismaClient();

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Cast prisma to any to access portfolio if types are missing
        const portfolios = await (prisma as any).portfolio.findMany({
            where: { userId: user.id },
            include: {
                domains: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        status: true,
                        createdAt: true,
                        isVerified: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(portfolios);
    } catch (error: any) {
        console.error('Error fetching portfolios:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, price, domainIds } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Fallback for stale db instance in dev
        const prisma = (db as any).portfolio ? db : new PrismaClient();

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify that all domainIds belong to the user
        if (domainIds && domainIds.length > 0) {
            const userDomainsCount = await prisma.domain.count({
                where: {
                    id: { in: domainIds },
                    userId: user.id,
                },
            });

            if (userDomainsCount !== domainIds.length) {
                return NextResponse.json({ error: 'One or more selected domains do not belong to you' }, { status: 403 });
            }
        }

        const portfolio = await (prisma as any).portfolio.create({
            data: {
                name,
                price: price ? parseFloat(price) : null,
                userId: user.id,
                domains: {
                    connect: domainIds?.map((id: string) => ({ id })) || [],
                },
            },
            include: {
                domains: true,
            },
        });

        return NextResponse.json(portfolio);
    } catch (error: any) {
        console.error('Error creating portfolio:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
