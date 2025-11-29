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
                take: 3,
            },
        },
    });

    if (!user) {
        return {
            title: 'User Not Found',
        };
    }

    const domainCount = user.domains.length;
    const domainList = user.domains.map((d: any) => d.name).join(', ');
    const description = domainCount > 0
        ? `${domainCount} domains available: ${domainList}`
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

    return <ProfileClient user={userData} domains={user.domains} username={username} />;
}
