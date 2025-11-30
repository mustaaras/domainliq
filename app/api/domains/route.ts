import { db } from '@/lib/db';
import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const tld = searchParams.get('tld');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const verified = searchParams.get('verified');
    const username = searchParams.get('username');
    const sort = searchParams.get('sort') || 'newest';

    const skip = (page - 1) * limit;

    const where: Prisma.DomainWhereInput = {};

    // Username filter
    if (username) {
      const user = await db.user.findUnique({
        where: { subdomain: username },
        select: { id: true }
      });

      if (user) {
        where.userId = user.id;
      } else {
        // If user not found, return empty list
        return Response.json({
          domains: [],
          pagination: { total: 0, pages: 0, page, limit }
        });
      }
    }

    // Search filter
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // TLD filter
    if (tld) {
      const tlds = tld.split(',').filter(Boolean);
      if (tlds.length > 0) {
        where.OR = tlds.map(ext => ({
          name: {
            endsWith: `.${ext}`,
            mode: 'insensitive',
          },
        }));
      }
    }

    // Price filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice);
      if (maxPrice) where.price.lte = parseInt(maxPrice);
    }

    // Verified filter
    if (verified === 'true') {
      where.isVerified = true;
    }

    // Sorting
    let orderBy: Prisma.DomainOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'expires_asc') {
      orderBy = { expiresAt: 'asc' };
    } else if (sort === 'expires_desc') {
      orderBy = { expiresAt: 'desc' };
    }

    const [domains, total] = await Promise.all([
      db.domain.findMany({
        where,
        take: limit,
        skip,
        orderBy,
        include: {
          user: {
            select: {
              name: true,
              subdomain: true,
              contactEmail: true,
              twitterHandle: true,
              whatsappNumber: true,
              linkedinProfile: true,
              telegramUsername: true,
              preferredContact: true,
            },
          },
        },
      }),
      db.domain.count({ where }),
    ]);

    return Response.json({
      domains,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Failed to fetch domains:', error);
    return Response.json({ error: 'Failed to fetch domains' }, { status: 500 });
  }
}