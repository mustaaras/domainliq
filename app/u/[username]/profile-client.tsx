'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { MessageCircle, Check, ShieldCheck, Search, Filter, X, Loader2, ExternalLink, Zap } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { getMainDomainUrl } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { ChatWidget } from '@/components/chat-widget';

interface Domain {
    id: string;
    name: string;
    price: number;
    status: string;
    isVerified?: boolean;
    expiresAt?: string | null;
    checkoutLink?: string | null;
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
    stripeOnboardingComplete?: boolean;
}

interface Portfolio {
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    domains: Domain[];
    createdAt: string;
}

interface ProfileClientProps {
    user: User;
    initialDomains: Domain[];
    initialPortfolios: Portfolio[];
    username: string;
    initialTotal: number;
}

export default function ProfileClient({ user, initialDomains, initialPortfolios, username, initialTotal }: ProfileClientProps) {
    // Track profile view
    useEffect(() => {
        const trackView = async () => {
            if (!user?.subdomain) return;
            try {
                await fetch('/api/health/ping', {
                    method: 'POST',
                    body: JSON.stringify({ subdomain: user.subdomain })
                });
            } catch (e) {
                // Ignore
            }
        };
        trackView();
    }, [user?.subdomain]);

    // Data state
    const [domains, setDomains] = useState<Domain[]>(initialDomains);
    const [portfolios, setPortfolios] = useState<Portfolio[]>(initialPortfolios || []);
    const [isLoading, setIsLoading] = useState(false);
    const [totalDomains, setTotalDomains] = useState(initialTotal);

    // View state
    const [viewMode, setViewMode] = useState<'domains' | 'portfolios'>('domains');
    const [expandedPortfolios, setExpandedPortfolios] = useState<Set<string>>(new Set());

    // Selection state
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
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
    const [limit, setLimit] = useState(12);

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
        if (viewMode === 'portfolios') return; // Don't fetch domains in portfolio view

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
    }, [user.subdomain, page, limit, sortBy, debouncedSearch, selectedTLDs, verificationFilter, priceMin, priceMax, viewMode]);

    // Initial fetch and refetch on filter changes
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
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

    const handleContact = async (portfolioId?: string) => {
        const consent = localStorage.getItem('domainliq_consent');
        if (!consent) {
            alert('Please accept our Terms of Service and Privacy Policy using the banner at the bottom of the page before contacting sellers.');
            return;
        }

        if (portfolioId) {
            setSelectedPortfolioId(portfolioId);
        } else {
            const selected = domains.filter(d => selectedIds.includes(d.id));
            if (selected.length === 0) {
                alert('Please select at least one domain');
                return;
            }
            setSelectedPortfolioId(null);
        }

        if (availableMethods.length > 1) {
            setShowContactModal(true);
        } else if (availableMethods.length === 1) {
            contactViaMethod(availableMethods[0].type, portfolioId);
        } else {
            alert("Seller hasn't provided any contact information yet.");
        }
    };

    const contactViaMethod = async (method: string, portfolioId?: string) => {
        let message = '';

        if (portfolioId) {
            const portfolio = portfolios.find(p => p.id === portfolioId);
            if (portfolio) {
                message = `Hi, I'm interested in buying your portfolio "${portfolio.name}" for $${portfolio.price?.toLocaleString() || 'negotiable'}.`;
            }
        } else {
            const selected = domains.filter(d => selectedIds.includes(d.id));
            const domainNames = selected.map(d => d.name).join(', ');
            message = `Hi, I'm interested in these domains: ${domainNames}`;
        }

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
                    const subject = encodeURIComponent(portfolioId ? 'Portfolio Inquiry' : 'Domain Inquiry');
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
        <div className="min-h-screen dark:bg-[#050505] bg-white dark:text-white text-gray-900 font-sans selection:bg-amber-500/30">
            <div className="max-w-7xl mx-auto px-4 py-8 pb-32 md:pb-12">
                {/* Header */}
                <header className="mb-8 text-center">
                    <Link href={getMainDomainUrl()} className="inline-block mb-6">
                        <Logo className="h-8 w-auto" />
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight dark:text-white text-gray-900 capitalize">
                        {user.subdomain}&apos;s Domains
                    </h1>
                    <p className="dark:text-gray-500 text-gray-600 mt-1">Domain Liquidation Platform</p>
                </header>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Controls Bar */}
                        <div className="relative flex items-center justify-center mb-6 z-30 min-h-[44px]">

                            {/* Center: View Toggle */}
                            <div className="flex bg-gray-100 dark:bg-white/5 rounded-lg p-1 border dark:border-white/10 border-gray-200">
                                <button
                                    onClick={() => setViewMode('domains')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'domains'
                                        ? 'bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    Domains
                                </button>
                                <button
                                    onClick={() => setViewMode('portfolios')}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'portfolios'
                                        ? 'bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    Portfolios
                                </button>
                            </div>

                            {/* Right Side: Filters & Count (Absolute on Desktop) */}
                            {viewMode === 'domains' && (
                                <div className="absolute right-0 top-0 bottom-0 flex items-center gap-3">
                                    <div className="text-sm dark:text-gray-400 text-gray-600 hidden sm:block">
                                        Found <span className="dark:text-white text-gray-900 font-medium">{totalDomains}</span> domains
                                    </div>

                                    <div className="relative">
                                        <button
                                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                                            className={`
                                            flex items-center justify-center px-3 py-2 border rounded-lg transition-all focus:outline-none focus:border-amber-500/50 relative
                                            ${showMobileFilters
                                                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-500'
                                                    : 'dark:bg-[#0A0A0A] bg-white dark:border-white/10 border-gray-300 dark:text-gray-400 text-gray-600 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/20'
                                                }
                                        `}
                                            aria-label="Filters"
                                        >
                                            <Filter className="h-4 w-4" />
                                            {activeFiltersCount > 0 && !showMobileFilters && (
                                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 dark:border-[#050505] border-white" />
                                            )}
                                        </button>

                                        {/* Filter Popover */}
                                        {showMobileFilters && (
                                            <>
                                                {/* Mobile Backdrop */}
                                                <div
                                                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 sm:hidden"
                                                    onClick={() => setShowMobileFilters(false)}
                                                />

                                                <div className={`
                                                fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] max-w-[260px] z-50
                                                sm:absolute sm:top-full sm:left-auto sm:right-0 sm:translate-x-0 sm:translate-y-0 sm:mt-2 sm:w-64
                                                dark:bg-[#0A0A0A] bg-white border dark:border-white/10 border-gray-200 rounded-xl shadow-xl p-4
                                            `}>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="font-semibold flex items-center gap-2 dark:text-white text-gray-900 text-sm">
                                                            Filters
                                                        </h3>
                                                        {activeFiltersCount > 0 && (
                                                            <button onClick={clearFilters} className="text-xs dark:text-amber-400 text-amber-600 hover:underline">
                                                                Clear all
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                                        {/* Search */}
                                                        <div>
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 dark:text-gray-500 text-gray-400" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search..."
                                                                    value={search}
                                                                    onChange={(e) => setSearch(e.target.value)}
                                                                    className="w-full dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg pl-8 pr-3 py-1.5 text-xs dark:text-white text-gray-900 focus:outline-none focus:border-amber-500/50"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* TLDs */}
                                                        <div>
                                                            <label className="text-[10px] font-medium dark:text-gray-400 text-gray-500 mb-2 block uppercase tracking-wider">Extensions</label>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {uniqueTLDs.map(tld => (
                                                                    <button
                                                                        key={tld}
                                                                        onClick={() => toggleTLD(tld)}
                                                                        className={`px-2 py-1 rounded text-[10px] transition-colors border ${selectedTLDs.has(tld)
                                                                            ? 'bg-amber-500 border-amber-500 text-white'
                                                                            : 'dark:bg-white/5 bg-gray-50 border-transparent dark:text-gray-300 text-gray-700 hover:bg-gray-100 dark:hover:bg-white/10'
                                                                            }`}
                                                                    >
                                                                        .{tld}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Price */}
                                                        <div>
                                                            <label className="text-[10px] font-medium dark:text-gray-400 text-gray-500 mb-2 block uppercase tracking-wider">Price Range</label>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="number"
                                                                    placeholder="Min"
                                                                    value={priceMin}
                                                                    onChange={(e) => setPriceMin(e.target.value)}
                                                                    className="w-full dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg px-2 py-1.5 text-xs dark:text-white text-gray-900 focus:outline-none focus:border-amber-500/50"
                                                                />
                                                                <input
                                                                    type="number"
                                                                    placeholder="Max"
                                                                    value={priceMax}
                                                                    onChange={(e) => setPriceMax(e.target.value)}
                                                                    className="w-full dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg px-2 py-1.5 text-xs dark:text-white text-gray-900 focus:outline-none focus:border-amber-500/50"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Status */}
                                                        <div>
                                                            <label className="text-[10px] font-medium dark:text-gray-400 text-gray-500 mb-2 block uppercase tracking-wider">Status</label>
                                                            <div className="space-y-1.5">
                                                                {['all', 'verified', 'unverified'].map((status) => (
                                                                    <label key={status} className="flex items-center gap-2 text-xs dark:text-gray-300 text-gray-700 cursor-pointer hover:text-amber-500 transition-colors">
                                                                        <input
                                                                            type="radio"
                                                                            name="verification"
                                                                            checked={verificationFilter === status}
                                                                            onChange={() => setVerificationFilter(status as any)}
                                                                            className="text-amber-500 focus:ring-amber-500 bg-transparent dark:border-white/20 border-gray-300 scale-90"
                                                                        />
                                                                        <span className="capitalize">{status === 'all' ? 'All Domains' : status}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Sort By - Mobile Only */}
                                                        <div>
                                                            <label className="text-[10px] font-medium dark:text-gray-400 text-gray-500 mb-2 block uppercase tracking-wider">Sort By</label>
                                                            <select
                                                                value={sortBy}
                                                                onChange={(e) => setSortBy(e.target.value)}
                                                                className="w-full dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg px-2 py-1.5 text-xs dark:text-white text-gray-900 focus:outline-none focus:border-amber-500/50"
                                                            >
                                                                <option value="newest">Newest Listed</option>
                                                                <option value="price_asc">Price: Low to High</option>
                                                                <option value="price_desc">Price: High to Low</option>
                                                                <option value="expires_asc">Expiring Soon</option>
                                                                <option value="expires_desc">Expiring Later</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content Grid */}
                        {viewMode === 'domains' ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                {isLoading ? (
                                    // Skeleton loading
                                    [...Array(6)].map((_, i) => (
                                        <div key={i} className="h-48 sm:h-64 rounded-xl bg-white/5 animate-pulse" />
                                    ))
                                ) : domains.length > 0 ? (
                                    domains.map((domain) => {
                                        const isSelected = selectedIds.includes(domain.id);
                                        const isSold = domain.status === 'sold';

                                        // Deterministic gradient based on domain ID - Yellow/Black Theme
                                        const gradients = [
                                            'from-amber-500/10 to-yellow-500/10 dark:from-amber-500/20 dark:to-yellow-500/20 hover:from-amber-500/20 hover:to-yellow-500/20',
                                            'from-yellow-500/10 to-orange-500/10 dark:from-yellow-500/20 dark:to-orange-500/20 hover:from-yellow-500/20 hover:to-orange-500/20',
                                            'from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-amber-500/20 hover:from-orange-500/20 hover:to-amber-500/20',
                                            'from-gray-500/10 to-slate-500/10 dark:from-gray-500/20 dark:to-slate-500/20 hover:from-gray-500/20 hover:to-slate-500/20',
                                            'from-neutral-500/10 to-stone-500/10 dark:from-neutral-500/20 dark:to-stone-500/20 hover:from-neutral-500/20 hover:to-stone-500/20',
                                            'from-amber-400/10 to-yellow-400/10 dark:from-amber-400/20 dark:to-yellow-400/20 hover:from-amber-400/20 hover:to-yellow-400/20',
                                            'from-yellow-600/10 to-amber-600/10 dark:from-yellow-600/20 dark:to-amber-600/20 hover:from-yellow-600/20 hover:to-amber-600/20',
                                            'from-zinc-500/10 to-neutral-500/10 dark:from-zinc-500/20 dark:to-neutral-500/20 hover:from-zinc-500/20 hover:to-neutral-500/20',
                                        ];
                                        const gradientIndex = domain.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
                                        const gradientClass = gradients[gradientIndex];

                                        return (
                                            <div
                                                key={domain.id}
                                                onClick={() => !isSold && toggleSelection(domain.id)}
                                                className={`
                                                group flex flex-col justify-between p-3 sm:p-5 rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer relative h-full overflow-hidden
                                                ${isSold
                                                        ? 'dark:bg-transparent bg-gray-100 border-transparent opacity-40 cursor-not-allowed'
                                                        : isSelected
                                                            ? 'dark:bg-amber-500/10 bg-amber-50 dark:border-amber-500/50 border-amber-400 ring-1 ring-amber-500/50'
                                                            : `bg-gradient-to-br ${gradientClass} border-transparent dark:hover:border-white/10 hover:border-gray-200 dark:hover:shadow-2xl dark:hover:shadow-black/40 shadow-sm hover:shadow-lg hover:-translate-y-1`
                                                    }
                                            `}
                                            >
                                                {/* Selection Indicator */}
                                                {!isSold && (
                                                    <div className={`
                                                    absolute top-3 right-3 sm:top-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all z-20
                                                    ${isSelected
                                                            ? 'bg-amber-500 border-amber-500 scale-100 opacity-100 shadow-sm'
                                                            : 'dark:border-white/20 border-gray-400/50 dark:bg-black/20 bg-white/40 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 backdrop-blur-md'
                                                        }
                                                `}>
                                                        {isSelected && (
                                                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" strokeWidth={3} />
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex flex-col gap-2 sm:gap-4 h-full relative z-10">
                                                    {/* Top: Name and Price */}
                                                    <div>
                                                        <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3 pr-6 sm:pr-8 overflow-hidden">
                                                            <h3 className="text-sm sm:text-xl font-bold dark:text-white text-gray-900 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight tracking-tight truncate w-full" title={domain.name}>
                                                                {domain.name}
                                                            </h3>
                                                        </div>

                                                        <div className="flex items-center gap-2 mb-2 sm:mb-4">
                                                            {isSold ? (
                                                                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg uppercase tracking-wider border border-red-500/20">
                                                                    SOLD
                                                                </span>
                                                            ) : (
                                                                <span className="font-mono text-lg sm:text-xl font-semibold dark:text-gray-200 text-gray-800 tracking-tight">
                                                                    ${domain.price.toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mt-auto pt-3 sm:pt-4 border-t dark:border-white/5 border-black/5 flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-2">
                                                        <div className="flex flex-col gap-1">
                                                            {domain.isVerified && (
                                                                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                                                                    <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                                                    <span className="hidden sm:inline">Verified Ownership</span>
                                                                    <span className="sm:hidden">Verified</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex gap-2 w-full sm:w-auto">
                                                            {domain.checkoutLink && (
                                                                <a
                                                                    href={domain.checkoutLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="flex items-center justify-center gap-1 px-2 py-0.5 text-[9px] font-bold text-white rounded-md bg-gradient-to-r from-[#00A4A6] to-[#00B8BA] hover:from-[#00B8BA] hover:to-[#00CDD0] transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-lg hover:shadow-[#00A4A6]/30 flex-1 sm:flex-none uppercase tracking-wide"
                                                                >
                                                                    GoDaddy
                                                                    <ExternalLink className="w-2 h-2 opacity-70" />
                                                                </a>
                                                            )}
                                                            {!domain.checkoutLink && user.stripeOnboardingComplete && (
                                                                <Link
                                                                    href={`${getMainDomainUrl()}/d/${domain.name}`}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="flex items-center justify-center gap-1 px-2 py-0.5 text-[9px] font-bold text-white rounded-md bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-lg hover:shadow-green-500/30 flex-1 sm:flex-none uppercase tracking-wide"
                                                                >
                                                                    <Zap className="w-2 h-2 fill-white/20" />
                                                                    Buy Now
                                                                </Link>
                                                            )}
                                                            <Link
                                                                href={`${getMainDomainUrl()}/d/${domain.name}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="flex items-center justify-center gap-1 px-2 py-0.5 text-[9px] font-bold dark:bg-white/5 bg-gray-100 dark:hover:bg-white/10 hover:bg-gray-200 dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 rounded-md border dark:border-white/5 border-gray-200 dark:hover:border-white/20 hover:border-gray-300 transition-all flex-1 sm:flex-none uppercase tracking-wide"
                                                            >
                                                                Details
                                                                <span className="text-xs leading-none mb-0.5 ml-0.5">→</span>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-full text-center py-12 dark:text-gray-600 text-gray-500">
                                        No domains found matching your filters.
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Portfolio List View
                            <div className="grid gap-4">
                                {portfolios.length > 0 ? (
                                    portfolios.map(portfolio => (
                                        <div
                                            key={portfolio.id}
                                            className="dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-200 rounded-xl p-6 hover:border-amber-500/50 transition-all group relative overflow-hidden"
                                        >
                                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                                                <div className="flex-1">
                                                    <div className="flex flex-col items-start md:flex-row md:items-center gap-y-2 gap-x-3 mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-xl font-bold dark:text-white text-gray-900">{portfolio.name}</h3>
                                                            {portfolio.domains.length > 0 && portfolio.domains.every(d => d.isVerified) && (
                                                                <div className="relative group/tooltip cursor-default">
                                                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30">
                                                                        <ShieldCheck className="h-3 w-3" />
                                                                        <span className="uppercase tracking-wider">Verified</span>
                                                                    </div>
                                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded shadow-sm whitespace-nowrap opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none select-none z-50">
                                                                        All domains verified
                                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[3px] border-transparent border-t-gray-900" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="self-start md:self-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                            {portfolio.domains.length} Domains
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 mb-2 md:mb-4">
                                                        {(expandedPortfolios.has(portfolio.id) ? portfolio.domains : portfolio.domains.slice(0, 5)).map(domain => (
                                                            <span key={domain.id} className="text-xs px-2 py-1.5 rounded-lg dark:bg-white/10 bg-white border dark:border-white/5 border-gray-200 dark:text-gray-300 text-gray-600 font-medium">
                                                                {domain.name}
                                                            </span>
                                                        ))}
                                                        {portfolio.domains.length > 5 && (
                                                            <button
                                                                onClick={() => {
                                                                    setExpandedPortfolios(prev => {
                                                                        const next = new Set(prev);
                                                                        if (next.has(portfolio.id)) {
                                                                            next.delete(portfolio.id);
                                                                        } else {
                                                                            next.add(portfolio.id);
                                                                        }
                                                                        return next;
                                                                    });
                                                                }}
                                                                className="text-xs px-2 py-1.5 rounded-lg dark:bg-amber-500/10 bg-amber-50 border dark:border-amber-500/20 border-amber-200 dark:text-amber-400 text-amber-600 font-medium hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors cursor-pointer"
                                                            >
                                                                {expandedPortfolios.has(portfolio.id) ? 'Show less' : `+${portfolio.domains.length - 5} more`}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-row items-center justify-between md:justify-end gap-4 border-t md:border-t-0 dark:border-white/10 border-gray-100 pt-4 md:pt-0 mt-2 md:mt-0 w-full md:w-auto">
                                                    <div className="text-left md:text-right">
                                                        {portfolio.price && (
                                                            <div className="text-2xl font-mono font-bold dark:text-white text-gray-900 leading-none mb-1">
                                                                ${portfolio.price.toLocaleString()}
                                                            </div>
                                                        )}
                                                        <p className="text-[10px] uppercase font-bold tracking-wider dark:text-gray-500 text-gray-400">
                                                            Listed {new Date(portfolio.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>

                                                    <button
                                                        onClick={() => handleContact(portfolio.id)}
                                                        className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all flex items-center gap-2"
                                                    >
                                                        <MessageCircle className="w-4 h-4" />
                                                        Inquire
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 dark:text-gray-600 text-gray-500 bg-gray-50 dark:bg-white/5 rounded-xl border dark:border-white/10 border-gray-200">
                                        <div className="mb-4 flex justify-center">
                                            <Filter className="w-12 h-12 opacity-20" />
                                        </div>
                                        <h3 className="text-lg font-medium dark:text-white text-gray-900 mb-1">No Portfolios Found</h3>
                                        <p>This seller hasn't created any portfolios yet.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pagination - Only for Domains view */}
                        {viewMode === 'domains' && totalDomains > 0 && (
                            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t dark:border-white/10 border-gray-200 pt-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium dark:text-gray-500 text-gray-600">Show:</span>
                                    <select
                                        value={limit}
                                        onChange={(e) => {
                                            setLimit(Number(e.target.value));
                                            setPage(1);
                                        }}
                                        className="dark:bg-[#0A0A0A] bg-white border dark:border-white/10 border-gray-300 rounded-lg px-2 py-1 text-sm dark:text-white text-gray-900 focus:outline-none focus:border-amber-500/50"
                                    >
                                        <option value={12}>12</option>
                                        <option value={24}>24</option>
                                        <option value={60}>60</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 text-sm font-medium rounded-lg border dark:border-white/10 border-gray-200 dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm font-medium dark:text-gray-500 text-gray-600 px-2">
                                        Page {page} of {Math.ceil(totalDomains / limit)}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(Math.ceil(totalDomains / limit), p + 1))}
                                        disabled={page >= Math.ceil(totalDomains / limit)}
                                        className="px-4 py-2 text-sm font-medium rounded-lg border dark:border-white/10 border-gray-200 dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Contact Button */}
            {
                viewMode === 'domains' && selectedIds.length > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t dark:from-[#050505] from-white dark:via-[#050505]/95 via-white/95 to-transparent pointer-events-none z-40">
                        <div className="max-w-3xl mx-auto pointer-events-auto">
                            <button
                                onClick={() => handleContact()}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-amber-500 dark:hover:bg-amber-400 hover:bg-amber-600 text-white rounded-xl font-medium shadow-lg transition-all dark:shadow-amber-500/50 shadow-amber-500/40"
                            >
                                <MessageCircle className="h-5 w-5" />
                                Contact Seller ({selectedIds.length} {selectedIds.length === 1 ? 'domain' : 'domains'})
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Contact Method Selection Modal */}
            {
                showContactModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowContactModal(false)}>
                        <div className="dark:bg-[#0A0A0A] bg-white border dark:border-white/10 border-gray-300 rounded-xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-xl font-bold mb-4 dark:text-white text-gray-900">Choose Contact Method</h3>
                            <p className="dark:text-gray-400 text-gray-600 text-sm mb-6">How would you like to contact the seller?</p>

                            <div className="space-y-3">
                                {availableMethods.map((method) => (
                                    <button
                                        key={method.type}
                                        onClick={() => {
                                            contactViaMethod(method.type, selectedPortfolioId || undefined);
                                            setShowContactModal(false);
                                        }}
                                        className="w-full flex items-center justify-between p-4 dark:bg-white/5 bg-gray-50 dark:hover:bg-white/10 hover:bg-gray-100 border dark:border-white/10 border-gray-300 dark:hover:border-amber-500/50 hover:border-amber-400 rounded-lg transition-all group"
                                    >
                                        <span className="dark:text-white text-gray-900 font-medium">{method.label}</span>
                                        <span className="dark:text-gray-400 text-gray-500 text-sm dark:group-hover:text-amber-400 group-hover:text-amber-600 transition-colors">→</span>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowContactModal(false)}
                                className="w-full mt-6 px-4 py-2 dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Chat Widget */}
            {
                domains.length > 0 && (
                    <ChatWidget
                        domainId={domains[0].id}
                        sellerName={user.name || user.subdomain}
                    />
                )
            }
        </div >
    );
}
