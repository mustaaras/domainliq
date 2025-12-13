import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// One-time cleanup endpoint to delete duplicate orders for whatever.bet
// POST to delete the duplicate, GET to just view
export async function POST() {
    try {
        // Find all orders for whatever.bet
        const orders = await db.order.findMany({
            where: {
                domain: { name: 'whatever.bet' },
            },
            orderBy: { createdAt: 'asc' }, // Oldest first
        });

        if (orders.length < 2) {
            return NextResponse.json({ message: 'No duplicate orders found' });
        }

        // Keep the first (completed) order, delete others
        const ordersToDelete = orders.slice(1); // All except the first

        for (const order of ordersToDelete) {
            await db.order.delete({
                where: { id: order.id },
            });
        }

        return NextResponse.json({
            message: `Deleted ${ordersToDelete.length} duplicate order(s)`,
            deletedOrderIds: ordersToDelete.map(o => o.id),
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const orders = await db.order.findMany({
            where: {
                domain: { name: 'whatever.bet' },
            },
            select: {
                id: true,
                status: true,
                amount: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });

        return NextResponse.json({
            count: orders.length,
            orders,
            note: 'POST to this endpoint to delete all except the first order',
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
