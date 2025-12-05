'use client';

import { Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { Portfolio } from '@/hooks/usePortfolios';

interface PortfolioListProps {
    portfolios: Portfolio[];
    isLoading: boolean;
    userSubdomain: string;
    onDelete: (id: string) => void;
}

export function PortfolioList({ portfolios, isLoading, userSubdomain, onDelete }: PortfolioListProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2].map(i => (
                    <div key={i} className="h-24 dark:bg-white/5 bg-gray-100 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (portfolios.length === 0) {
        return (
            <div className="text-center py-12 dark:text-gray-500 text-gray-400">
                <p>No portfolios yet.</p>
                <p className="text-sm mt-1">Create one to bundle your domains.</p>
            </div>
        );
    }

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this portfolio? The domains inside will remain in your account.')) {
            onDelete(id);
        }
    };

    return (
        <div className="space-y-3">
            {portfolios.map(portfolio => (
                <div
                    key={portfolio.id}
                    className="dark:bg-white/5 bg-white border dark:border-white/10 border-gray-200 rounded-lg p-4 hover:border-amber-500/50 transition-all"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <h4 className="font-semibold dark:text-white text-gray-900 truncate">
                                {portfolio.name}
                            </h4>
                            <div className="text-sm dark:text-gray-400 text-gray-600 mt-1">
                                {portfolio.domains.length} domain{portfolio.domains.length !== 1 ? 's' : ''}
                                {portfolio.price && (
                                    <span className="ml-2 text-amber-500 font-medium">
                                        ${portfolio.price.toLocaleString()}
                                    </span>
                                )}
                            </div>

                            {/* Domain Pills */}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {portfolio.domains.slice(0, 3).map(d => (
                                    <span
                                        key={d.id}
                                        className="text-xs px-2 py-0.5 dark:bg-white/10 bg-gray-100 dark:text-gray-300 text-gray-600 rounded"
                                    >
                                        {d.name}
                                    </span>
                                ))}
                                {portfolio.domains.length > 3 && (
                                    <span className="text-xs px-2 py-0.5 dark:bg-white/5 bg-gray-50 dark:text-gray-500 text-gray-400 rounded">
                                        +{portfolio.domains.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {userSubdomain && (
                                <Link
                                    href={`https://${userSubdomain}.domainliq.com`}
                                    target="_blank"
                                    className="p-1.5 dark:text-gray-400 text-gray-500 dark:hover:text-white hover:text-gray-900 transition-colors"
                                    title="View Portfolio"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                            )}
                            <button
                                onClick={() => handleDelete(portfolio.id)}
                                className="p-1.5 text-red-400 hover:text-red-500 transition-colors"
                                title="Delete Portfolio"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
