import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

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

    const userRoutes = users.map((user) => ({
        url: `${baseUrl}/u/${user.subdomain}`,
        lastModified: user.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    return [...routes, ...userRoutes];
}
