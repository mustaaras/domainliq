import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const where = search ? {
      name: {
        contains: search,
        mode: 'insensitive' as const,
      },
    } : {};

    const [domains, total] = await Promise.all([
      db.domain.findMany({
        where,
        take: limit,
        skip,
        orderBy: {
          createdAt: 'desc',
        },
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