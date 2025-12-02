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

    console.log(`[DomainLanderPage] Lookup for domain: ${domainName}`);

    const domain = await db.domain.findFirst({
        where: {
            name: domainName,
        },
        include: {
            user: true,
        },
    });

    if (!domain) {
        console.log(`[DomainLanderPage] Domain NOT FOUND in DB: ${domainName}`);
        notFound();
    }

    console.log(`[DomainLanderPage] Domain FOUND: ${domainName} (User: ${domain.user.email})`);

    const isOwner = session?.user?.email === domain.user.email;

    return <DomainLanderClient domain={domain} isOwner={isOwner} />;
}
