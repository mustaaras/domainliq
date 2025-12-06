import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import DomainLanderClient from './domain-lander-client';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface DomainLanderPageProps {
    params: Promise<{ domain: string }>;
}

export async function generateMetadata({ params }: DomainLanderPageProps): Promise<Metadata> {
    const { domain: domainName } = await params;

    const domain = await db.domain.findFirst({
        where: { name: domainName },
    });

    if (!domain) {
        return {
            title: 'Domain Not Found',
            robots: { index: false, follow: false },
        };
    }

    return {
        title: `${domain.name} is available for sale`,
        description: `Make an offer on ${domain.name} today. Secure this premium domain for your business via DomainLiq.`,
        robots: {
            index: true,
            follow: true,
        },
    };
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
    console.log(`[DomainLanderPage] Session User: ${session?.user?.email}`);
    console.log(`[DomainLanderPage] Is Owner: ${session?.user?.email === domain.user.email}`);

    const isOwner = session?.user?.email === domain.user.email;

    return <DomainLanderClient domain={domain} isOwner={isOwner} />;
}
