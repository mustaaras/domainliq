import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

// Force dynamic generation to access runtime DATABASE_URL
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://domainliq.com';

    // Static routes
    const routes = [
        '',
        '/buyer-guide',
        '/seller-guide',
        '/contact',
        '/privacy',
        '/terms',
        '/auth/login',
        '/auth/signup',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic routes (User profiles)
    const users = await db.user.findMany({
        select: {
            subdomain: true,
            updatedAt: true,
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });

    // Dynamic routes (Public Domain Landers)
    const domains = await db.domain.findMany({
        select: {
            name: true,
            updatedAt: true,
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });

    const userRoutes = users.map((user) => ({
        url: `${baseUrl}/u/${user.subdomain}`,
        lastModified: user.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    const domainRoutes = domains.map((domain) => ({
        url: `${baseUrl}/d/${domain.name}`,
        lastModified: domain.updatedAt,
        changeFrequency: 'daily' as const,
        priority: 0.7,
    }));

    return [...routes, ...userRoutes, ...domainRoutes];
}
