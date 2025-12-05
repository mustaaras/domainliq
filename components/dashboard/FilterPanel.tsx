'use client';

import { X } from 'lucide-react';
import type { Domain } from '@/hooks/useDomains';

interface FilterPanelProps {
    availableTLDs: string[];
    selectedTLDs: Set<string>;
    verificationFilter: 'all' | 'verified' | 'unverified';
    priceMin: string;
    priceMax: string;
    sortBy: string;
    onToggleTLD: (tld: string) => void;
    onSetVerificationFilter: (filter: 'all' | 'verified' | 'unverified') => void;
    onSetPriceMin: (value: string) => void;
    onSetPriceMax: (value: string) => void;
    onSetSortBy: (value: string) => void;
    onClearFilters: () => void;
    onClose: () => void;
}

export function FilterPanel({
    availableTLDs,
    selectedTLDs,
    verificationFilter,
    priceMin,
    priceMax,
    sortBy,
    onToggleTLD,
    onSetVerificationFilter,
    onSetPriceMin,
    onSetPriceMax,
    onSetSortBy,
    onClearFilters,
    onClose,
}: FilterPanelProps) {
    return (
        <div className="dark:bg-[#0A0A0A] bg-white border dark:border-white/10 border-gray-200 rounded-xl p-4 mb-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold dark:text-white text-gray-900">Filters</h3>
                <button
                    onClick={onClose}
                    className="dark:text-gray-400 text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* TLD Filter */}
            <div className="mb-4">
                <label className="block text-xs font-medium dark:text-gray-400 text-gray-600 mb-2">
                    Extensions
                </label>
                <div className="flex flex-wrap gap-2">
                    {availableTLDs.slice(0, 10).map(tld => (
                        <button
                            key={tld}
                            onClick={() => onToggleTLD(tld)}
                            className={`px-2 py-1 text-xs rounded-md border transition-colors ${selectedTLDs.has(tld)
                                    ? 'bg-amber-500 border-amber-500 text-white'
                                    : 'dark:bg-white/5 bg-gray-50 dark:border-white/10 border-gray-300 dark:text-gray-300 text-gray-600 dark:hover:bg-white/10 hover:bg-gray-100'
                                }`}
                        >
                            .{tld}
                        </button>
                    ))}
                </div>
            </div>

            {/* Verification Filter */}
            <div className="mb-4">
                <label className="block text-xs font-medium dark:text-gray-400 text-gray-600 mb-2">
                    Verification Status
                </label>
                <div className="flex gap-2">
                    {(['all', 'verified', 'unverified'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => onSetVerificationFilter(status)}
                            className={`px-3 py-1 text-xs rounded-md border transition-colors capitalize ${verificationFilter === status
                                    ? 'bg-amber-500 border-amber-500 text-white'
                                    : 'dark:bg-white/5 bg-gray-50 dark:border-white/10 border-gray-300 dark:text-gray-300 text-gray-600 dark:hover:bg-white/10 hover:bg-gray-100'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="mb-4">
                <label className="block text-xs font-medium dark:text-gray-400 text-gray-600 mb-2">
                    Price Range ($)
                </label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        value={priceMin}
                        onChange={e => onSetPriceMin(e.target.value)}
                        className="w-full dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg px-3 py-1.5 text-sm dark:text-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                    />
                    <input
                        type="number"
                        placeholder="Max"
                        value={priceMax}
                        onChange={e => onSetPriceMax(e.target.value)}
                        className="w-full dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg px-3 py-1.5 text-sm dark:text-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                    />
                </div>
            </div>

            {/* Sort */}
            <div className="mb-4">
                <label className="block text-xs font-medium dark:text-gray-400 text-gray-600 mb-2">
                    Sort By
                </label>
                <select
                    value={sortBy}
                    onChange={e => onSetSortBy(e.target.value)}
                    className="w-full dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg px-3 py-1.5 text-sm dark:text-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                    <option value="name_desc">Name: Z to A</option>
                </select>
            </div>

            {/* Clear Filters */}
            <button
                onClick={onClearFilters}
                className="w-full py-2 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors border-t dark:border-white/10 border-gray-200 pt-3"
            >
                Clear All Filters
            </button>
        </div>
    );
}
