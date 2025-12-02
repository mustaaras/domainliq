import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import DomainLanderClient from './domain-lander-client';

interface DomainLanderPageProps {
    params: Promise<{ domain: string }>;
}

export default async function DomainLanderPage({ params }: DomainLanderPageProps) {
    const { domain: domainName } = await params;
    const session = await auth();

    const domain = await db.domain.findFirst({
        where: {
            name: domainName,
        },
        include: {
            user: true,
        },
    });

    if (!domain) {
        notFound();
    }

    const isOwner = session?.user?.email === domain.user.email;

    return <DomainLanderClient domain={domain} isOwner={isOwner} />;
}
