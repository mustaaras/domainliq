import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import ProfileClient from './profile-client';
import type { Metadata } from 'next';

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{
        username: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { username } = await params;

    const user = await db.user.findUnique({
        where: { subdomain: username },
        include: {
            domains: {
                where: { status: 'available' },
                take: 10,
                orderBy: { createdAt: 'desc' },
            },
            _count: {
                select: { domains: { where: { status: 'available' } } }
            }
        },
    });

    if (!user) {
        return {
            title: 'User Not Found',
        };
    }

    const totalCount = user._count.domains;
    const domainList = user.domains.map((d: any) => d.name).join(', ');
    const description = totalCount > 0
        ? `${totalCount} domains available: ${domainList}${totalCount > 10 ? '...' : ''}`
        : `Check out ${user.name || username}'s domain marketplace`;

    return {
        title: `${user.name || username}'s Domains - DomainLiq`,
        description,
        openGraph: {
            title: `${user.name || username}'s Domain Listing`,
            description,
            images: [
                {
                    url: `/api/og/${username}`,
                    width: 1200,
                    height: 630,
                    alt: `${user.name || username}'s domains`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${user.name || username}'s Domain Listing`,
            description,
            images: [`/api/og/${username}`],
        },
    };
}

export default async function UserProfilePage({ params }: PageProps) {
    const { username } = await params;

    const user = await db.user.findUnique({
        where: { subdomain: username },
        include: {
            domains: {
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (!user) {
        notFound();
    }

    const userData = {
        name: user.name,
        subdomain: user.subdomain,
        contactEmail: user.contactEmail,
        twitterHandle: user.twitterHandle,
        whatsappNumber: user.whatsappNumber,
        linkedinProfile: user.linkedinProfile,
        telegramUsername: user.telegramUsername,
        preferredContact: user.preferredContact,
    };

    const serializedDomains = user.domains.map(domain => ({
        ...domain,
        createdAt: domain.createdAt.toISOString(),
        expiresAt: domain.expiresAt ? domain.expiresAt.toISOString() : null,
        verificationToken: domain.verificationToken || null, // Ensure null instead of undefined
    }));

    return <ProfileClient user={userData} initialDomains={serializedDomains} username={username} />;
}
