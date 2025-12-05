'use client';

import { Loader2, Plus, DollarSign, CheckSquare, ShieldCheck } from 'lucide-react';
import type { Domain } from '@/hooks/useDomains';

interface PortfolioFormProps {
    domains: Domain[];
    name: string;
    price: string;
    selectedDomainIds: Set<string>;
    isSubmitting: boolean;
    error: string;
    onNameChange: (value: string) => void;
    onPriceChange: (value: string) => void;
    onToggleDomain: (domainId: string) => void;
    onSelectionChange: (ids: Set<string>) => void;
    onSubmit: () => Promise<{ success: boolean; error?: string }>;
    submitLabel?: string;
    submitIcon?: React.ElementType | null;
}

export function PortfolioForm({
    domains,
    name,
    price,
    selectedDomainIds,
    isSubmitting,
    error,
    onNameChange,
    onPriceChange,

    onToggleDomain,
    onSelectionChange,
    onSubmit,
    submitLabel = 'Create Portfolio',
    submitIcon: Icon = Plus,
}: PortfolioFormProps) {
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Portfolio Name
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={e => onNameChange(e.target.value)}
                    placeholder="Premium .com Collection"
                    className="w-full dark:bg-black/20 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg px-4 py-2 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Bundle Price ($) - Optional
                </label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 dark:text-gray-500 text-gray-400" />
                    <input
                        type="number"
                        value={price}
                        onChange={e => onPriceChange(e.target.value)}
                        placeholder="5000"
                        className="w-full dark:bg-black/20 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg pl-9 pr-4 py-2 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        min="0"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                    Select Domains ({selectedDomainIds.size} selected)
                </label>

                {/* Search Input */}
                <div className="mb-3 relative">
                    <input
                        type="text"
                        placeholder="Search domains..."
                        className="w-full text-sm dark:bg-black/20 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg pl-9 pr-3 py-2 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        onChange={(e) => {
                            // We handle filtering in the parent or local state?
                            // Better to handle local filtering here since we have the full list
                            const term = e.target.value.toLowerCase();
                            const container = document.getElementById('domain-list-container');
                            if (container) {
                                const buttons = container.querySelectorAll('button[data-domain-name]');
                                buttons.forEach((btn: any) => {
                                    const name = btn.getAttribute('data-domain-name');
                                    if (name && name.includes(term)) {
                                        btn.style.display = 'flex';
                                    } else {
                                        btn.style.display = 'none';
                                    }
                                });
                            }
                        }}
                    />
                    <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                    <button
                        type="button"
                        onClick={() => onSelectionChange(new Set(domains.map(d => d.id)))}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded text-gray-700 dark:text-gray-300 transition-colors"
                    >
                        Select All
                    </button>
                    <button
                        type="button"
                        onClick={() => onSelectionChange(new Set(domains.filter(d => d.isVerified).map(d => d.id)))}
                        className="text-xs px-2 py-1 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 rounded text-green-700 dark:text-green-400 transition-colors flex items-center gap-1"
                    >
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                    </button>
                    <button
                        type="button"
                        onClick={() => onSelectionChange(new Set(domains.filter(d => !d.isVerified).map(d => d.id)))}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded text-gray-700 dark:text-gray-300 transition-colors"
                    >
                        Unverified
                    </button>
                    <button
                        type="button"
                        onClick={() => onSelectionChange(new Set())}
                        className="text-xs px-2 py-1 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded text-red-700 dark:text-red-400 transition-colors"
                    >
                        None
                    </button>
                </div>
                <div id="domain-list-container" className="max-h-48 overflow-y-auto border dark:border-white/10 border-gray-200 rounded-lg divide-y dark:divide-white/10 divide-gray-100">
                    {domains.length === 0 ? (
                        <div className="p-4 text-center dark:text-gray-500 text-gray-400 text-sm">
                            No domains available. Add domains first.
                        </div>
                    ) : (
                        domains.map(domain => (
                            <button
                                key={domain.id}
                                data-domain-name={domain.name.toLowerCase()}
                                type="button"
                                onClick={() => onToggleDomain(domain.id)}
                                className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${selectedDomainIds.has(domain.id)
                                    ? 'dark:bg-amber-500/10 bg-amber-50'
                                    : 'dark:hover:bg-white/5 hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selectedDomainIds.has(domain.id)
                                    ? 'bg-amber-500 border-amber-500 text-white'
                                    : 'dark:border-white/30 border-gray-300'
                                    }`}>
                                    {selectedDomainIds.has(domain.id) && <CheckSquare className="w-3 h-3" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-medium dark:text-white text-gray-900 truncate text-sm flex items-center gap-2">
                                        {domain.name}
                                        {domain.isVerified && (
                                            <ShieldCheck className="w-4 h-4 text-green-500 dark:text-green-400" />
                                        )}
                                    </div>
                                    <div className="text-xs dark:text-gray-500 text-gray-400">
                                        ${domain.price.toLocaleString()}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
                type="submit"
                disabled={isSubmitting || selectedDomainIds.size === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon && <Icon className="h-4 w-4" />}
                {submitLabel}
            </button>
        </form>
    );
}
