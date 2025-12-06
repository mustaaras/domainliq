'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Eye, ArrowUp, ArrowDown, Calendar } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard-header';

interface StatsOverview {
    totalViews: number;
    totalVisitors: number;
    totalDomains: number;
}

interface TopDomain {
    id: string;
    name: string;
    views: number;
    isVerified: boolean;
    updatedAt: string;
}

export default function StatisticsPage() {
    const [overview, setOverview] = useState<StatsOverview | null>(null);
    const [topDomains, setTopDomains] = useState<TopDomain[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/user/stats');
                if (res.ok) {
                    const data = await res.json();
                    setOverview(data.overview);
                    setTopDomains(data.topDomains);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen dark:bg-[#050505] bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen dark:bg-[#050505] bg-gray-50 font-sans">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <DashboardHeader />

                <div className="mb-8">
                    <h1 className="text-2xl font-bold dark:text-white text-gray-900 flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 text-amber-500" />
                        Traffic Analytics
                    </h1>
                    <p className="dark:text-gray-400 text-gray-600 mt-1">
                        Track views and engagement across your domain portfolio.
                    </p>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="dark:bg-[#0A0A0A] bg-white border dark:border-white/10 border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium dark:text-gray-400 text-gray-500">Total Page Views</h3>
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Eye className="h-5 w-5 text-amber-500" />
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold dark:text-white text-gray-900">
                                {overview?.totalViews.toLocaleString() || '0'}
                            </span>
                            {/* Placeholder for growth metric */}
                            {overview && overview.totalViews > 0 && (
                                <span className="text-xs font-medium text-green-500 flex items-center mb-1">
                                    <ArrowUp className="h-3 w-3 mr-0.5" />
                                    100%
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="dark:bg-[#0A0A0A] bg-white border dark:border-white/10 border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium dark:text-gray-400 text-gray-500">Estimated Visitors</h3>
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Users className="h-5 w-5 text-blue-500" />
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold dark:text-white text-gray-900">
                                {overview?.totalVisitors.toLocaleString() || '0'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Unique sessions (est.)</p>
                    </div>

                    <div className="dark:bg-[#0A0A0A] bg-white border dark:border-white/10 border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium dark:text-gray-400 text-gray-500">Active Domains</h3>
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Globe className="h-5 w-5 text-purple-500" />
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold dark:text-white text-gray-900">
                                {overview?.totalDomains.toLocaleString() || '0'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Top Domains Table */}
                <div className="dark:bg-[#0A0A0A] bg-white border dark:border-white/10 border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b dark:border-white/10 border-gray-200 flex items-center justify-between">
                        <h2 className="text-lg font-bold dark:text-white text-gray-900">Most Viewed Domains</h2>
                        <div className="flex items-center gap-2 text-sm dark:text-gray-400 text-gray-500 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                            <Calendar className="h-4 w-4" />
                            <span>All Time</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="dark:bg-white/5 bg-gray-50 border-b dark:border-white/10 border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-medium dark:text-gray-400 text-gray-600">Domain Name</th>
                                    <th className="px-6 py-4 font-medium dark:text-gray-400 text-gray-600 text-right">Views</th>
                                    <th className="px-6 py-4 font-medium dark:text-gray-400 text-gray-600 text-right">Last Updated</th>
                                    <th className="px-6 py-4 font-medium dark:text-gray-400 text-gray-600 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-white/10 divide-gray-200">
                                {topDomains.length > 0 ? (
                                    topDomains.map((domain) => (
                                        <tr key={domain.id} className="dark:hover:bg-white/5 hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium dark:text-white text-gray-900">
                                                {domain.name}
                                                <a href={`/d/${domain.name}`} target="_blank" className="ml-2 inline-flex opacity-0 group-hover:opacity-100 dark:text-gray-500 text-gray-400 hover:text-amber-500 transition-all">
                                                    <TrendingUp className="h-3 w-3" />
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono dark:text-gray-300 text-gray-700">
                                                {domain.views.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right dark:text-gray-500 text-gray-500">
                                                {new Date(domain.updatedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${domain.isVerified
                                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                                    : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                                                    }`}>
                                                    {domain.isVerified ? 'Verified' : 'Unverified'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center dark:text-gray-500 text-gray-500">
                                            No traffic data available yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper icon component since Lucide Globe wasn't imported in earlier snippet
function Globe({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
        </svg>
    )
}
