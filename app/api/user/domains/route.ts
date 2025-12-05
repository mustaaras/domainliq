import { db } from '@/lib/db';
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const domains = await db.domain.findMany({
            where: { user: { email: session.user.email } },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                price: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                isVerified: true,
                verificationToken: true,
                verificationMethod: true,
                checkoutLink: true,
                expiresAt: true,
            },
        });

        return NextResponse.json(domains);
    } catch (error) {
        console.error('User domains fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Get user ID
        const user = await db.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Domain validation function
        const validateDomain = (name: string): { valid: boolean; error?: string; normalized?: string } => {
            if (!name || typeof name !== 'string') {
                return { valid: false, error: 'Domain name is required' };
            }

            // Normalize: trim and lowercase
            const normalized = name.trim().toLowerCase();

            // Check for empty after trim
            if (!normalized) {
                return { valid: false, error: 'Domain name cannot be empty' };
            }

            // Check for spaces
            if (/\s/.test(normalized)) {
                return { valid: false, error: `Invalid domain "${name}": contains spaces` };
            }

            // Basic domain format validation (at least one dot, valid characters)
            const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/;
            if (!domainRegex.test(normalized)) {
                return { valid: false, error: `Invalid domain format "${name}"` };
            }

            return { valid: true, normalized };
        };

        // Handle Bulk Upload (Array)
        if (Array.isArray(body)) {
            // Validate all domains first
            const validatedDomains: Array<{ name: string; price: number }> = [];
            const errors: string[] = [];

            for (let i = 0; i < body.length; i++) {
                const item = body[i];
                const validation = validateDomain(item.name);

                if (!validation.valid) {
                    errors.push(`Line ${i + 1}: ${validation.error}`);
                    continue;
                }

                // Check price
                const price = parseFloat(item.price);
                if (isNaN(price) || price < 0) {
                    errors.push(`Line ${i + 1}: Invalid price for "${item.name}"`);
                    continue;
                }

                validatedDomains.push({
                    name: validation.normalized!,
                    price
                });
            }

            if (errors.length > 0) {
                return NextResponse.json({
                    error: 'Validation errors',
                    details: errors.slice(0, 10), // Show first 10 errors
                    totalErrors: errors.length
                }, { status: 400 });
            }

            if (validatedDomains.length === 0) {
                return NextResponse.json({ error: 'No valid domains provided' }, { status: 400 });
            }

            // Check for duplicates within the upload
            const nameSet = new Set<string>();
            const internalDuplicates: string[] = [];
            const uniqueDomains = validatedDomains.filter(d => {
                if (nameSet.has(d.name)) {
                    internalDuplicates.push(d.name);
                    return false;
                }
                nameSet.add(d.name);
                return true;
            });

            // Check for existing domains
            const existingDomains = await db.domain.findMany({
                where: {
                    userId: user.id,
                    name: { in: uniqueDomains.map(d => d.name) }
                },
                select: { name: true }
            });

            const existingNames = new Set(existingDomains.map(d => d.name));
            const newDomains = uniqueDomains.filter(d => !existingNames.has(d.name));

            const skippedCount = validatedDomains.length - newDomains.length;

            if (newDomains.length === 0) {
                return NextResponse.json({
                    error: 'All domains already exist or are duplicates',
                    skipped: skippedCount
                }, { status: 400 });
            }

            const domains = newDomains.map(d => ({
                name: d.name,
                price: d.price,
                userId: user.id,
                status: 'available',
            }));

            const result = await db.domain.createMany({
                data: domains,
            });

            return NextResponse.json({
                count: result.count,
                message: `Successfully added ${result.count} domain(s)`,
                skipped: skippedCount > 0 ? skippedCount : undefined,
                duplicates: internalDuplicates.length > 0 ? internalDuplicates.slice(0, 5) : undefined
            });
        }

        // Handle Single Upload (Object)
        const { name, price } = body;

        if (!name || !price) {
            return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
        }

        // Validate domain
        const validation = validateDomain(name);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        // Validate price
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
        }

        // Check if domain already exists for this user
        const existing = await db.domain.findFirst({
            where: {
                userId: user.id,
                name: validation.normalized
            }
        });

        if (existing) {
            return NextResponse.json({ error: 'Domain already exists in your list' }, { status: 400 });
        }

        const domain = await db.domain.create({
            data: {
                name: validation.normalized!,
                price: parsedPrice,
                userId: user.id,
                status: 'available',
                verificationToken: crypto.randomUUID(),
                isVerified: false,
            },
        });

        // DO NOT register with Coolify yet - user must verify domain ownership first
        console.log(`[Domain] Created domain ${domain.name} - pending verification`);

        return NextResponse.json(domain);
    } catch (error) {
        console.error('Add domain error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
