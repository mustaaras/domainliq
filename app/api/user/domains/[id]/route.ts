import { db } from '@/lib/db';
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { status, price, checkoutLink, showPriceOnLanding } = await req.json();

        // Verify ownership
        const domain = await db.domain.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!domain) {
            return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
        }

        if (domain.user.email !== session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Update domain
        const updateData: any = {};
        if (status) updateData.status = status;
        if (price !== undefined) updateData.price = price;
        if (showPriceOnLanding !== undefined) updateData.showPriceOnLanding = showPriceOnLanding;

        // Handle checkout link update
        if (checkoutLink !== undefined) {
            // Check price requirement (either new price or existing price)
            const currentPrice = price !== undefined ? price : domain.price;
            if (currentPrice < 99 && checkoutLink !== null && checkoutLink !== '') {
                return NextResponse.json(
                    { error: 'Checkout links are only available for domains priced $99 or more' },
                    { status: 400 }
                );
            }

            // Validate checkout link domain
            if (checkoutLink && !checkoutLink.startsWith('https://checkoutlink.godaddy.com/')) {
                return NextResponse.json(
                    { error: 'Invalid checkout link. Must be a https://checkoutlink.godaddy.com/ link' },
                    { status: 400 }
                );
            }

            updateData.checkoutLink = checkoutLink;
        }

        const updatedDomain = await db.domain.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(updatedDomain);
    } catch (error) {
        console.error('Update domain error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const domain = await db.domain.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!domain) {
            return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
        }

        if (domain.user.email !== session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await db.domain.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete domain error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
