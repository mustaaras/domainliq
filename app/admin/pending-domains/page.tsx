import { db } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';

export default async function AdminPendingDomainsPage() {
    // 1. Fetch A-record verified domains
    const aRecordDomains = await db.domain.findMany({
        where: {
            verificationMethod: 'a',
            isVerified: true,
        },
        orderBy: {
            verifiedAt: 'desc',
        },
        include: {
            user: {
                select: {
                    email: true,
                    name: true,
                }
            }
        }
    });

    // 2. Fetch recent users (for subdomain registration)
    const recentUsers = await db.user.findMany({
        take: 50,
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            id: true,
            name: true,
            email: true,
            subdomain: true,
            createdAt: true,
        }
    });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Admin: Pending Coolify Setup</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* A-Record Verified Domains */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">
                            A-Record Verified Domains
                            <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                {aRecordDomains.length}
                            </span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {aRecordDomains.length === 0 ? (
                            <p className="text-zinc-500">No A-record verified domains found.</p>
                        ) : (
                            aRecordDomains.map((domain) => (
                                <div key={domain.id} className="border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <a
                                                href={`https://${domain.name}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-blue-600 hover:underline text-lg"
                                            >
                                                {domain.name}
                                            </a>
                                            <p className="text-sm text-zinc-500">Owner: {domain.user.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-zinc-400">
                                                Verified {domain.verifiedAt ? formatDistanceToNow(domain.verifiedAt, { addSuffix: true }) : 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 bg-zinc-50 dark:bg-zinc-800 p-2 rounded text-xs font-mono text-zinc-600 dark:text-zinc-400">
                                        Add to Coolify: Settings → Domains → {domain.name}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Users / Subdomains */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">
                            Recent Users (Subdomains)
                            <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                {recentUsers.length}
                            </span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {recentUsers.map((user) => (
                            <div key={user.id} className="border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="font-medium text-lg">{user.subdomain}</span>
                                        <span className="text-zinc-400">.domainliq.com</span>
                                        <p className="text-sm text-zinc-500">{user.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-zinc-400">
                                            Joined {formatDistanceToNow(user.createdAt, { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2 bg-zinc-50 dark:bg-zinc-800 p-2 rounded text-xs font-mono text-zinc-600 dark:text-zinc-400">
                                    Check Coolify Logs for: {user.subdomain}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
