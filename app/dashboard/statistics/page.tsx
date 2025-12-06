'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Eye, ArrowUp, ArrowDown, Calendar, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

interface ChartDataPoint {
    date: string;
    views: number;
}

export default function StatisticsPage() {
    const [overview, setOverview] = useState<StatsOverview | null>(null);
    const [topDomains, setTopDomains] = useState<TopDomain[]>([]);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters & Pagination
    const [range, setRange] = useState('all'); // 24h, 7d, 30d, all
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/user/stats?range=${range}&page=${page}&limit=${limit}`);
                if (res.ok) {
                    const data = await res.json();
                    setOverview(data.overview);
                    setTopDomains(data.topDomains);
                    setChartData(data.chartData);
                    setTotalPages(data.totalPages);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [range, page]);

    const handleRangeChange = (newRange: string) => {
        setRange(newRange);
        setPage(1); // Reset to page 1 when filter changes
    };

    if (isLoading && !overview) {
        return (
            <div className="min-h-screen dark:bg-[#050505] bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen dark:bg-[#050505] bg-gray-50 font-sans">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-2"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold dark:text-white text-gray-900 flex items-center gap-2">
                            <BarChart3 className="h-6 w-6 text-amber-500" />
                            Statistics
                        </h1>
                    </div>

                    {/* Time Range Filter */}
                    <div className="flex bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg p-1">
                        {['24h', '7d', '30d', 'all'].map((r) => (
                            <button
                                key={r}
                                onClick={() => handleRangeChange(r)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${range === r
                                        ? 'bg-amber-500 text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                                    }`}
                            >
                                {r === '24h' ? '24 Hours' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'All Time'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-[#111] p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Page Views</p>
                                <h3 className="text-3xl font-bold dark:text-white text-gray-900 mt-2">{overview?.totalViews.toLocaleString()}</h3>
                            </div>
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <Eye className="h-5 w-5 text-amber-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-green-500">
                            {/* Mock trend for now */}
                            <ArrowUp className="h-4 w-4 mr-1" />
                            <span>12% vs last period</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#111] p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Visitors</p>
                                <h3 className="text-3xl font-bold dark:text-white text-gray-900 mt-2">{overview?.totalVisitors.toLocaleString()}</h3>
                            </div>
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Users className="h-5 w-5 text-blue-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            Based on unique sessions
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#111] p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Domains</p>
                                <h3 className="text-3xl font-bold dark:text-white text-gray-900 mt-2">{overview?.totalDomains.toLocaleString()}</h3>
                            </div>
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            Tracking enabled
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="bg-white dark:bg-[#111] p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm mb-8">
                    <h2 className="text-lg font-bold dark:text-white text-gray-900 mb-6">Traffic Overview</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#888', fontSize: 12 }}
                                    minTickGap={30}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#888', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#111',
                                        borderColor: '#333',
                                        color: '#fff',
                                        borderRadius: '8px'
                                    }}
                                    itemStyle={{ color: '#f59e0b' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorViews)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Most Viewed Domains Table */}
                <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-white/10">
                        <h2 className="text-lg font-bold dark:text-white text-gray-900">Top Performing Domains</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-white/5 text-xs uppercase text-gray-500 dark:text-gray-400 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Domain Name</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Views</th>
                                    <th className="px-6 py-4 text-right">Last Updated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                                {topDomains.length > 0 ? (
                                    topDomains.map((domain) => (
                                        <tr key={domain.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <a
                                                    href={`/d/${domain.name}`} // Or link to internal domain details if preferred
                                                    target="_blank"
                                                    className="font-medium text-gray-900 dark:text-white hover:text-amber-500 transition-colors"
                                                >
                                                    {domain.name}
                                                </a>
                                            </td>
                                            <td className="px-6 py-4">
                                                {domain.isVerified ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-500 border border-gray-500/20">
                                                        Unverified
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-bold text-gray-900 dark:text-white">
                                                    {domain.views.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(domain.updatedAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            No domains found for this period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Page {page} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
