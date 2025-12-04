'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function addDomain(formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { error: 'Unauthorized' };
        }

        const name = formData.get('name') as string;
        const price = formData.get('price') as string;

        if (!name) {
            return { error: 'Domain name is required' };
        }

        // Normalize: trim and lowercase
        const normalizedName = name.trim().toLowerCase();

        // Basic domain validation
        const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/;
        if (!domainRegex.test(normalizedName)) {
            return { error: 'Invalid domain format' };
        }

        const parsedPrice = price ? parseFloat(price) : 0;
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            return { error: 'Invalid price' };
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return { error: 'User not found' };
        }

        // Check if domain exists
        const existing = await db.domain.findFirst({
            where: {
                userId: user.id,
                name: normalizedName
            }
        });

        if (existing) {
            return { error: 'Domain already exists' };
        }

        await db.domain.create({
            data: {
                name: normalizedName,
                price: parsedPrice,
                userId: user.id,
                status: 'available',
                verificationToken: crypto.randomUUID(),
                isVerified: false,
            },
        });

        revalidatePath('/dashboard/custom-domains');
        return { success: true };

    } catch (error) {
        console.error('Add domain error:', error);
        return { error: 'Internal server error' };
    }
}
