import { db } from '@/lib/db';
import { notFound } from 'next/navigation';

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{
        subdomain: string;
    }>;
}

export default async function UserProfilePage({ params }: PageProps) {
    const { subdomain } = await params;

    const user = await db.user.findUnique({
        where: { subdomain },
        include: {
            domains: {
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (!user) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
            <div className="max-w-3xl mx-auto px-4 py-8 pb-32 md:pb-12">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                {user.name || subdomain}'s Domains
                            </h1>
                            <p className="text-gray-500 mt-1">Premium Domains for Sale</p>
                        </div>
                    </div>
                </header>

                {/* List */}
                <div className="flex flex-col gap-2">
                    {user.domains.length > 0 ? (
                        user.domains.map((domain: any) => (
                            <div
                                key={domain.id}
                                className={`
                  group flex items-center justify-between p-4 rounded-xl border transition-all duration-200
                  ${domain.status === 'sold'
                                        ? 'bg-transparent border-transparent opacity-40'
                                        : 'bg-white/5 border-transparent hover:bg-white/10'
                                    }
                `}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`
                    w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200 flex-shrink-0
                    ${domain.status === 'sold'
                                            ? 'border-gray-700 bg-gray-800'
                                            : 'border-gray-600 group-hover:border-gray-500'
                                        }
                  `}>
                                        {domain.status === 'sold' && <div className="w-2 h-2 rounded-full bg-gray-600" />}
                                    </div>

                                    <div className="flex flex-col">
                                        <span className={`text-lg font-medium ${domain.status === 'sold' ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                                            {domain.name}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {domain.status === 'sold' ? (
                                        <span className="text-xs font-medium text-red-400 uppercase tracking-wider">Sold</span>
                                    ) : (
                                        <span className="font-mono text-gray-400">
                                            ${domain.price.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-600">
                            No domains listed yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
