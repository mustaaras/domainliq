'use client';

import { ShieldCheck, Pencil, Trash2, ExternalLink, CheckSquare } from 'lucide-react';
import type { Domain } from '@/hooks/useDomains';

interface DomainCardProps {
    domain: Domain;
    isSelected: boolean;
    isSelectionMode: boolean;
    onSelect: () => void;
    onToggleSold: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onVerify: () => void;
}

export function DomainCard({
    domain,
    isSelected,
    isSelectionMode,
    onSelect,
    onToggleSold,
    onEdit,
    onDelete,
    onVerify,
}: DomainCardProps) {
    const isSold = domain.status === 'sold';

    return (
        <div
            className={`flex items-center justify-between p-4 rounded-lg transition-all ${isSelected
                    ? 'dark:bg-amber-500/10 bg-amber-50 dark:border-amber-500/30 border-amber-300'
                    : isSold
                        ? 'dark:bg-white/5 bg-gray-100 opacity-60'
                        : 'dark:bg-white/5 bg-gray-50 dark:hover:bg-white/10 hover:bg-white'
                } border dark:border-white/10 border-gray-200`}
        >
            {/* Left: Selection + Domain Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
                {isSelectionMode && (
                    <button
                        onClick={onSelect}
                        className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected
                                ? 'bg-amber-500 border-amber-500 text-white'
                                : 'dark:border-white/30 border-gray-300 dark:hover:border-amber-500 hover:border-amber-500'
                            }`}
                    >
                        {isSelected && <CheckSquare className="w-3 h-3" />}
                    </button>
                )}

                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium dark:text-white text-gray-900 truncate">
                            {domain.name}
                        </span>
                        {domain.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
                        )}
                        {isSold && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/20 text-amber-500 rounded-full">
                                SOLD
                            </span>
                        )}
                    </div>
                    <div className="text-sm dark:text-gray-400 text-gray-600">
                        ${domain.price.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
                {!domain.isVerified && (
                    <button
                        onClick={onVerify}
                        className="px-2 py-1 text-xs font-medium dark:bg-green-500/10 bg-green-50 dark:text-green-400 text-green-600 rounded-md dark:hover:bg-green-500/20 hover:bg-green-100 transition-colors flex items-center gap-1"
                    >
                        <ShieldCheck className="w-3 h-3" />
                        Verify
                    </button>
                )}

                <button
                    onClick={onToggleSold}
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${isSold
                            ? 'dark:bg-gray-500/10 bg-gray-100 dark:text-gray-400 text-gray-600 dark:hover:bg-gray-500/20 hover:bg-gray-200'
                            : 'dark:bg-amber-500/10 bg-amber-50 dark:text-amber-400 text-amber-600 dark:hover:bg-amber-500/20 hover:bg-amber-100'
                        }`}
                >
                    {isSold ? 'Mark Available' : 'Mark Sold'}
                </button>

                <button
                    onClick={onEdit}
                    className="p-1.5 dark:text-gray-400 text-gray-500 dark:hover:text-white hover:text-gray-900 transition-colors"
                    title="Edit"
                >
                    <Pencil className="w-4 h-4" />
                </button>

                {domain.checkoutLink && (
                    <a
                        href={domain.checkoutLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 dark:text-gray-400 text-gray-500 dark:hover:text-white hover:text-gray-900 transition-colors"
                        title="Checkout Link"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                )}

                <button
                    onClick={onDelete}
                    className="p-1.5 text-red-400 hover:text-red-500 transition-colors"
                    title="Delete"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
