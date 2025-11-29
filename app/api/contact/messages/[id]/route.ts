import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const { id } = await params;

        // Check if user is authenticated and is admin
        if (!session?.user?.email || session.user.email !== 'mustafa.aras@hotmail.com.tr') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { read } = await req.json();

        await db.contactMessage.update({
            where: { id },
            data: { read },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update message:', error);
        return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const { id } = await params;

        // Check if user is authenticated and is admin
        if (!session?.user?.email || session.user.email !== 'mustafa.aras@hotmail.com.tr') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await db.contactMessage.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete message:', error);
        return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
    }
}
