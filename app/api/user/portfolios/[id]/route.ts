import { db } from '@/lib/db';
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Fallback for stale db instance in dev
        const prisma = (db as any).portfolio ? db : new PrismaClient();

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const portfolio = await (prisma as any).portfolio.findUnique({
            where: { id },
            include: {
                domains: true,
            },
        });

        if (!portfolio) {
            return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
        }

        // Only owner can view details via this API (public view will be separate)
        if (portfolio.userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        return NextResponse.json(portfolio);
    } catch (error: any) {
        console.error('Error fetching portfolio:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Fallback for stale db instance in dev
        const prisma = (db as any).portfolio ? db : new PrismaClient();

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const portfolio = await (prisma as any).portfolio.findUnique({
            where: { id },
        });

        if (!portfolio) {
            return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
        }

        if (portfolio.userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await (prisma as any).portfolio.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting portfolio:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name, price, addDomainIds, removeDomainIds } = body;

        // Fallback for stale db instance in dev
        const prisma = (db as any).portfolio ? db : new PrismaClient();

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const portfolio = await (prisma as any).portfolio.findUnique({
            where: { id },
        });

        if (!portfolio) {
            return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
        }

        if (portfolio.userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (price !== undefined) updateData.price = price ? parseFloat(price) : null;

        // Construct domain updates
        const domainUpdates: any = {};
        if (addDomainIds && addDomainIds.length > 0) {
            // Verify ownership
            const count = await prisma.domain.count({
                where: {
                    id: { in: addDomainIds },
                    userId: user.id
                }
            });
            if (count !== addDomainIds.length) {
                return NextResponse.json({ error: 'Invalid domains selected' }, { status: 403 });
            }
            domainUpdates.connect = addDomainIds.map((did: string) => ({ id: did }));
        }
        if (removeDomainIds && removeDomainIds.length > 0) {
            domainUpdates.disconnect = removeDomainIds.map((did: string) => ({ id: did }));
        }

        if (Object.keys(domainUpdates).length > 0) {
            updateData.domains = domainUpdates;
        }

        const updatedPortfolio = await (prisma as any).portfolio.update({
            where: { id },
            data: updateData,
            include: { domains: true },
        });

        return NextResponse.json(updatedPortfolio);
    } catch (error: any) {
        console.error('Error updating portfolio:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
