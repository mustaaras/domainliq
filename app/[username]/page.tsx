import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import ProfileClient from './profile-client';

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{
        username: string;
    }>;
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
