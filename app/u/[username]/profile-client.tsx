'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MessageCircle, Check, ShieldCheck, Search, Filter, X, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface Domain {
    id: string;
    name: string;
    price: number;
    status: string;
    isVerified?: boolean;
    expiresAt?: string | null;
}

interface User {
    name: string | null;
    subdomain: string;
    contactEmail: string | null;
    twitterHandle: string | null;
    whatsappNumber: string | null;
    linkedinProfile: string | null;
    telegramUsername: string | null;
    preferredContact: string;
}

interface ProfileClientProps {
    user: User;
    initialDomains: Domain[];
    username: string;
}

export default function ProfileClient({ user, initialDomains, username }: ProfileClientProps) {
    // Data state
    const [domains, setDomains] = useState<Domain[]>(initialDomains);
    const [isLoading, setIsLoading] = useState(false);
    const [totalDomains, setTotalDomains] = useState(0);

    // Selection state
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showContactModal, setShowContactModal] = useState(false);

    // Filter state
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [selectedTLDs, setSelectedTLDs] = useState<Set<string>>(new Set());
    const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all');
    const [priceMin, setPriceMin] = useState<string>('');
    const [priceMax, setPriceMax] = useState<string>('');
    const [sortBy, setSortBy] = useState('newest');

    // Pagination state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);

    // Mobile filter state
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Get available contact methods
    const availableMethods = [
        user.contactEmail && { type: 'email', label: 'Email', value: user.contactEmail },
        user.twitterHandle && { type: 'twitter', label: 'X / Twitter', value: user.twitterHandle },
        user.whatsappNumber && { type: 'whatsapp', label: 'WhatsApp', value: user.whatsappNumber },
        user.linkedinProfile && { type: 'linkedin', label: 'LinkedIn', value: user.linkedinProfile },
        user.telegramUsername && { type: 'telegram', label: 'Telegram', value: user.telegramUsername },
    ].filter(Boolean) as Array<{ type: string; label: string; value: string }>;

    // Fetch domains when filters change
    const fetchDomains = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                username: user.subdomain,
                page: page.toString(),
                limit: limit.toString(),
                sort: sortBy,
            });

            if (debouncedSearch) params.append('search', debouncedSearch);
            if (selectedTLDs.size > 0) params.append('tld', Array.from(selectedTLDs).join(','));
            if (verificationFilter !== 'all') params.append('verified', verificationFilter === 'verified' ? 'true' : 'false');
            if (priceMin) params.append('minPrice', priceMin);
            if (priceMax) params.append('maxPrice', priceMax);

            const res = await fetch(`/api/domains?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch domains');

            const data = await res.json();
            setDomains(data.domains);
            setTotalDomains(data.pagination.total);
        } catch (error) {
            console.error('Error fetching domains:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user.subdomain, page, limit, sortBy, debouncedSearch, selectedTLDs, verificationFilter, priceMin, priceMax]);

    // Initial fetch and refetch on filter changes
    useEffect(() => {
        fetchDomains();
    }, [fetchDomains]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, selectedTLDs, verificationFilter, priceMin, priceMax, sortBy]);

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleContact = async () => {
        const consent = localStorage.getItem('domainliq_consent');
        if (!consent) {
            alert('Please accept our Terms of Service and Privacy Policy using the banner at the bottom of the page before contacting sellers.');
            return;
        }

        const selected = domains.filter(d => selectedIds.includes(d.id));
        if (selected.length === 0) {
            alert('Please select at least one domain');
            return;
        }

        if (availableMethods.length > 1) {
            setShowContactModal(true);
        } else if (availableMethods.length === 1) {
            contactViaMethod(availableMethods[0].type);
        } else {
            alert("Seller hasn't provided any contact information yet.");
        }
    };

    const contactViaMethod = async (method: string) => {
        const selected = domains.filter(d => selectedIds.includes(d.id));
        const domainNames = selected.map(d => d.name).join(', ');
        const message = `Hi, I'm interested in these domains: ${domainNames}`;

        switch (method) {
            case 'twitter':
                if (user.twitterHandle) {
                    await navigator.clipboard.writeText(message);
                    window.open(`https://x.com/messages/compose?recipient=${user.twitterHandle}`, '_blank');
                }
                break;
            case 'whatsapp':
                if (user.whatsappNumber) {
                    const encodedMessage = encodeURIComponent(message);
                    window.open(`https://wa.me/${user.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`, '_blank');
                }
                break;
            case 'linkedin':
                if (user.linkedinProfile) {
                    await navigator.clipboard.writeText(message);
                    window.open(user.linkedinProfile, '_blank');
                }
                break;
            case 'telegram':
                if (user.telegramUsername) {
                    const encodedMessage = encodeURIComponent(message);
                    window.open(`https://t.me/${user.telegramUsername}?text=${encodedMessage}`, '_blank');
                }
                break;
            default: // email
                const email = user.contactEmail;
                if (email) {
                    const subject = encodeURIComponent('Domain Inquiry');
                    const body = encodeURIComponent(message);
                    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
                }
                break;
        }
    };

    // Extract unique TLDs from initial domains for the filter list (approximation)
    // In a real app, you might want to fetch available TLDs from the backend
    const uniqueTLDs = Array.from(new Set(initialDomains.map(d => {
        const parts = d.name.split('.');
        return parts[parts.length - 1];
    }))).sort();

    const toggleTLD = (tld: string) => {
        setSelectedTLDs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tld)) newSet.delete(tld);
            else newSet.add(tld);
            return newSet;
        });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedTLDs(new Set());
        setVerificationFilter('all');
        setPriceMin('');
        setPriceMax('');
        setSortBy('newest');
    };

    const activeFiltersCount = (search ? 1 : 0) + selectedTLDs.size + (verificationFilter !== 'all' ? 1 : 0) + (priceMin || priceMax ? 1 : 0);

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500/30">
            <div className="max-w-7xl mx-auto px-4 py-8 pb-32 md:pb-12">
                {/* Header */}
                <header className="mb-8 text-center">
                    <Link href="/" className="inline-block mb-6">
                        <img src="/logo.svg" alt="DomainLiq" className="h-8 w-auto" />
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        {user.name || username}'s Domains
                    </h1>
                    <p className="text-gray-500 mt-1">Domain Liquidation Listing Platform</p>
                </header>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar - Desktop */}
                    <div className="hidden lg:block w-64 flex-shrink-0 space-y-6">
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4 sticky top-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Filter className="h-4 w-4" /> Filters
                                </h3>
                                {activeFiltersCount > 0 && (
                                    <button onClick={clearFilters} className="text-xs text-amber-400 hover:text-amber-300">
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {/* Search */}
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search domains..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                                    />
                                </div>
                            </div>

                            {/* TLDs */}
                            <div className="mb-4">
                                <label className="text-sm font-medium text-gray-400 mb-2 block">Extensions</label>
                                <div className="flex flex-wrap gap-2">
                                    {uniqueTLDs.map(tld => (
                                        <button
                                            key={tld}
                                            onClick={() => toggleTLD(tld)}
                                            className={`px-2 py-1 rounded text-xs transition-colors ${selectedTLDs.has(tld)
                                                    ? 'bg-amber-600 text-white'
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            .{tld}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-4">
                                <label className="text-sm font-medium text-gray-400 mb-2 block">Price Range</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={priceMin}
                                        onChange={(e) => setPriceMin(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={priceMax}
                                        onChange={(e) => setPriceMax(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                                    />
                                </div>
                            </div>

                            {/* Verification */}
                            <div className="mb-4">
                                <label className="text-sm font-medium text-gray-400 mb-2 block">Status</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="verification"
                                            checked={verificationFilter === 'all'}
                                            onChange={() => setVerificationFilter('all')}
                                            className="text-amber-500 focus:ring-amber-500 bg-transparent border-white/20"
                                        />
                                        All
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="verification"
                                            checked={verificationFilter === 'verified'}
                                            onChange={() => setVerificationFilter('verified')}
                                            className="text-amber-500 focus:ring-amber-500 bg-transparent border-white/20"
                                        />
                                        Verified Only
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="verification"
                                            checked={verificationFilter === 'unverified'}
                                            onChange={() => setVerificationFilter('unverified')}
                                            className="text-amber-500 focus:ring-amber-500 bg-transparent border-white/20"
                                        />
                                        Unverified Only
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden mb-4">
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0A0A0A] border border-white/10 rounded-lg text-white"
                        >
                            <Filter className="h-4 w-4" />
                            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                        </button>
                    </div>

                    {/* Mobile Filters Panel */}
                    {showMobileFilters && (
                        <div className="lg:hidden mb-6 bg-[#0A0A0A] border border-white/10 rounded-xl p-4">
                            {/* Same filters as desktop, simplified for brevity in this view */}
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                />
                                {/* Add other mobile filters here if needed, keeping it simple for now */}
                                <div className="flex gap-2">
                                    <button onClick={clearFilters} className="flex-1 py-2 text-sm text-gray-400 border border-white/10 rounded-lg">Reset</button>
                                    <button onClick={() => setShowMobileFilters(false)} className="flex-1 py-2 text-sm bg-amber-600 text-white rounded-lg">Apply</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Sort and Limit Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div className="text-sm text-gray-400">
                                Found <span className="text-white font-medium">{totalDomains}</span> domains
                            </div>
                            <div className="flex items-center gap-4">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
                                >
                                    <option value="newest">Newest Listed</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="expires_asc">Expiring Soon</option>
                                    <option value="expires_desc">Expiring Later</option>
                                </select>
                                <select
                                    value={limit}
                                    onChange={(e) => {
                                        setLimit(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    className="bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
                                >
                                    <option value={20}>20 per page</option>
                                    <option value={50}>50 per page</option>
                                    <option value={100}>100 per page</option>
                                </select>
                            </div>
                        </div>

                        {/* Domain List */}
                        <div className="space-y-2">
                            {isLoading ? (
                                <div className="py-20 flex justify-center">
                                    <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                                </div>
                            ) : domains.length > 0 ? (
                                domains.map((domain) => (
                                    <div
                                        key={domain.id}
                                        onClick={() => domain.status === 'available' && toggleSelection(domain.id)}
                                        className={`
                                            group flex items-center justify-between p-4 rounded-xl border transition-all duration-200
                                            ${domain.status === 'sold'
                                                ? 'bg-transparent border-transparent opacity-40 cursor-not-allowed'
                                                : selectedIds.includes(domain.id)
                                                    ? 'bg-amber-500/10 border-amber-500/30'
                                                    : 'bg-white/5 border-transparent hover:bg-white/10 cursor-pointer'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`
                                                w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200 flex-shrink-0
                                                ${domain.status === 'sold'
                                                    ? 'border-gray-700 bg-gray-800'
                                                    : selectedIds.includes(domain.id)
                                                        ? 'border-amber-500 bg-amber-500'
                                                        : 'border-gray-600 group-hover:border-gray-500'
                                                }
                                            `}>
                                                {domain.status === 'sold' ? (
                                                    <div className="w-2 h-2 rounded-full bg-gray-600" />
                                                ) : selectedIds.includes(domain.id) ? (
                                                    <Check className="h-3 w-3 text-white" />
                                                ) : null}
                                            </div>

                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-lg font-medium ${domain.status === 'sold' ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                                                        {domain.name}
                                                    </span>
                                                    {domain.isVerified && (
                                                        <div className="group relative">
                                                            <ShieldCheck className="h-4 w-4 text-green-400" />
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                                Ownership Verified
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                {domain.expiresAt && (
                                                    <span className="text-xs text-gray-500">
                                                        Exp: {new Date(domain.expiresAt).toLocaleDateString()}
                                                    </span>
                                                )}
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
                                    No domains found matching your filters.
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalDomains > 0 && (
                            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-500">
                                    Page {page} of {Math.ceil(totalDomains / limit)}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(Math.ceil(totalDomains / limit), p + 1))}
                                    disabled={page >= Math.ceil(totalDomains / limit)}
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Contact Button */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pointer-events-none z-40">
                    <div className="max-w-3xl mx-auto pointer-events-auto">
                        <button
                            onClick={handleContact}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-medium shadow-lg transition-all hover:shadow-amber-500/50"
                        >
                            <MessageCircle className="h-5 w-5" />
                            Contact Seller ({selectedIds.length} {selectedIds.length === 1 ? 'domain' : 'domains'})
                        </button>
                    </div>
                </div>
            )}

            {/* Contact Method Selection Modal */}
            {showContactModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowContactModal(false)}>
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4 text-white">Choose Contact Method</h3>
                        <p className="text-gray-400 text-sm mb-6">How would you like to contact the seller?</p>

                        <div className="space-y-3">
                            {availableMethods.map((method) => (
                                <button
                                    key={method.type}
                                    onClick={() => {
                                        contactViaMethod(method.type);
                                        setShowContactModal(false);
                                    }}
                                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/50 rounded-lg transition-all group"
                                >
                                    <span className="text-white font-medium">{method.label}</span>
                                    <span className="text-gray-400 text-sm group-hover:text-amber-400 transition-colors">→</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowContactModal(false)}
                            className="w-full mt-6 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
