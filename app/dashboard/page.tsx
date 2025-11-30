'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Plus, Trash2, Settings, ExternalLink, DollarSign, LogOut, Shield, ShieldCheck, Copy, Check, CheckSquare, Filter, X } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { verifyDomain } from '../actions/verify-domain';

interface Domain {
    id: string;
    name: string;
    price: number;
    status: string;
    createdAt: string;
    isVerified: boolean;
    verificationToken: string | null;
}

export default function DashboardPage() {
    const router = useRouter();
    const sessionData = useSession();
    const { data: session, status } = sessionData || {};

    const [domains, setDomains] = useState<Domain[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Verification state
    const [verifyingId, setVerifyingId] = useState<string | null>(null);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [verificationMessage, setVerificationMessage] = useState('');
    const [activeMethod, setActiveMethod] = useState<'txt' | 'ns' | null>(null);
    const [copiedToken, setCopiedToken] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [domainsPerPage, setDomainsPerPage] = useState(10);

    // New domain form state
    const [newDomain, setNewDomain] = useState({ name: '', price: '' });
    const [addError, setAddError] = useState('');

    // Bulk upload state
    const [bulkText, setBulkText] = useState('');
    const [bulkError, setBulkError] = useState('');

    // User subdomain for profile link
    const [userSubdomain, setUserSubdomain] = useState('');

    // Bulk delete state
    const [selectedDomainIds, setSelectedDomainIds] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);
    const [isInSelectionMode, setIsInSelectionMode] = useState(false);
    const [isBulkVerifying, setIsBulkVerifying] = useState(false);

    // Filter state
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTLDs, setSelectedTLDs] = useState<Set<string>>(new Set());
    const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all');
    const [priceMin, setPriceMin] = useState<string>('');
    const [priceMax, setPriceMax] = useState<string>('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated') {
            fetchUserDomains();
            fetchUserSubdomain();
        }
    }, [status, router]);

    const fetchUserSubdomain = async () => {
        try {
            const res = await fetch('/api/user/settings');
            if (!res.ok) throw new Error('Failed to fetch user data');
            const data = await res.json();
            setUserSubdomain(data.subdomain || '');
        } catch (error) {
            console.error(error);
        }
    };

    const fetchUserDomains = async () => {
        try {
            const res = await fetch('/api/user/domains');
            if (!res.ok) throw new Error('Failed to fetch domains');
            const data = await res.json();
            setDomains(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddDomain = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdding(true);
        setAddError('');

        try {
            const res = await fetch('/api/user/domains', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newDomain.name,
                    price: parseFloat(newDomain.price)
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to add domain');
            }

            const addedDomain = await res.json();
            setDomains([addedDomain, ...domains]);
            setNewDomain({ name: '', price: '' }); // Reset form
        } catch (error: any) {
            setAddError(error.message);
        } finally {
            setIsAdding(false);
        }
    };

    const handleBulkUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setBulkError('');
        setIsAdding(true);

        try {
            const lines = bulkText.trim().split('\n').filter(line => line.trim());
            if (lines.length === 0) {
                throw new Error('Please enter at least one domain');
            }
            if (lines.length > 500) {
                throw new Error('Maximum 500 domains per bulk upload');
            }

            const domainsToAdd = [];
            for (let i = 0; i < lines.length; i++) {
                const parts = lines[i].trim().split(/\s+/);
                if (parts.length !== 2) {
                    throw new Error(`Line ${i + 1}: Invalid format. Use "domain.com price"`);
                }
                const [name, priceStr] = parts;
                const price = parseFloat(priceStr);
                if (isNaN(price) || price <= 0) {
                    throw new Error(`Line ${i + 1}: Invalid price "${priceStr}"`);
                }
                domainsToAdd.push({ name, price });
            }

            // Add all domains in one request
            const res = await fetch('/api/user/domains', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(domainsToAdd)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to add domains');
            }

            // Refresh domains list
            await fetchUserDomains();

            setBulkText('');
            setAddError('');
            alert('Domains added successfully!');
        } catch (error: any) {
            setBulkError(error.message);
        } finally {
            setIsAdding(false);
        }
    };

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/');
    };

    const handleToggleSold = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'sold' ? 'available' : 'sold';

        try {
            const res = await fetch(`/api/user/domains/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error('Failed to update domain');

            // Update local state
            setDomains(domains.map(d =>
                d.id === id ? { ...d, status: newStatus } : d
            ));
        } catch (error) {
            console.error(error);
            alert('Failed to update domain status');
        }
    };

    const handleDeleteDomain = async (domainId: string) => {
        if (!confirm('Are you sure you want to delete this domain?')) return;

        try {
            const res = await fetch(`/api/user/domains/${domainId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete domain');
            }

            setDomains(domains.filter(d => d.id !== domainId));
            // Remove from selection if it was selected
            setSelectedDomainIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(domainId);
                return newSet;
            });
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedDomainIds.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedDomainIds.size} domain(s)?`)) return;

        setIsDeleting(true);
        try {
            const deletePromises = Array.from(selectedDomainIds).map(id =>
                fetch(`/api/user/domains/${id}`, { method: 'DELETE' })
            );

            await Promise.all(deletePromises);
            setDomains(domains.filter(d => !selectedDomainIds.has(d.id)));
            setSelectedDomainIds(new Set());
        } catch (error: any) {
            alert('Failed to delete some domains');
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleSelectDomain = (domainId: string) => {
        setSelectedDomainIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(domainId)) {
                newSet.delete(domainId);
            } else {
                newSet.add(domainId);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        const currentPageDomains = domains.slice(
            (currentPage - 1) * domainsPerPage,
            currentPage * domainsPerPage
        );

        if (selectedDomainIds.size === currentPageDomains.length) {
            // Deselect all
            setSelectedDomainIds(new Set());
        } else {
            // Select all on current page
            setSelectedDomainIds(new Set(currentPageDomains.map(d => d.id)));
        }
    };

    const handleBulkVerify = async () => {
        if (selectedDomainIds.size === 0) return;

        setIsBulkVerifying(true);
        const selectedDomains = domains.filter(d => selectedDomainIds.has(d.id));

        for (const domain of selectedDomains) {
            try {
                await verifyDomain(domain.id);
                // Small delay between verifications to avoid overwhelming the server
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`Failed to verify ${domain.name}:`, error);
            }
        }

        setIsBulkVerifying(false);
        fetchUserDomains(); // Refresh the list
    };

    // Get unique TLDs from domains
    const uniqueTLDs = Array.from(new Set(domains.map(d => {
        const parts = d.name.split('.');
        return parts[parts.length - 1];
    }))).sort();

    // Apply filters
    const filteredDomains = domains.filter(domain => {
        // TLD filter
        if (selectedTLDs.size > 0) {
            const tld = domain.name.split('.').pop() || '';
            if (!selectedTLDs.has(tld)) return false;
        }

        // Verification filter
        if (verificationFilter === 'verified' && !domain.isVerified) return false;
        if (verificationFilter === 'unverified' && domain.isVerified) return false;

        // Price filter
        if (priceMin && domain.price < parseFloat(priceMin)) return false;
        if (priceMax && domain.price > parseFloat(priceMax)) return false;

        return true;
    });

    const toggleTLD = (tld: string) => {
        setSelectedTLDs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tld)) {
                newSet.delete(tld);
            } else {
                newSet.add(tld);
            }
            return newSet;
        });
    };

    const clearFilters = () => {
        setSelectedTLDs(new Set());
        setVerificationFilter('all');
        setPriceMin('');
        setPriceMax('');
    };

    const activeFiltersCount = selectedTLDs.size +
        (verificationFilter !== 'all' ? 1 : 0) +
        (priceMin || priceMax ? 1 : 0);

    const handleVerifyDomain = async () => {
        if (!selectedDomain) return;

        setVerificationStatus('loading');
        setVerificationMessage('');

        try {
            const result = await verifyDomain(selectedDomain.id);

            if (result.success) {
                setVerificationStatus('success');
                setVerificationMessage('Domain verified successfully!');
                // Update local state
                setDomains(domains.map(d =>
                    d.id === selectedDomain.id ? { ...d, isVerified: true } : d
                ));
                setTimeout(() => {
                    setShowVerifyModal(false);
                    setVerificationStatus('idle');
                }, 2000);
            } else {
                setVerificationStatus('error');
                setVerificationMessage(result.error || 'Verification failed');
            }
        } catch (error) {
            setVerificationStatus('error');
            setVerificationMessage('An unexpected error occurred');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2000);
    };

    const openVerifyModal = async (domain: Domain) => {
        setSelectedDomain(domain);
        setVerificationStatus('idle');
        setVerificationMessage('');
        setShowVerifyModal(true);

        // If token is missing, generate it
        if (!domain.verificationToken) {
            try {
                const res = await fetch(`/api/user/domains/${domain.id}/verify-token`, {
                    method: 'POST'
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.token) {
                        // Update local state
                        setDomains(prev => prev.map(d =>
                            d.id === domain.id ? { ...d, verificationToken: data.token } : d
                        ));
                        // Update selected domain in modal
                        setSelectedDomain(prev => prev ? { ...prev, verificationToken: data.token } : null);
                    }
                }
            } catch (error) {
                console.error('Failed to generate token:', error);
            }
        }
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-gray-400 mt-1">Manage your domains and account</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/"
                            className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Home
                        </Link>
                        <Link
                            href={`/u/${userSubdomain}`}
                            target="_blank"
                            className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <ExternalLink className="h-4 w-4" />
                            View Your Store
                        </Link>
                        <Link
                            href="/settings"
                            className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Settings className="h-4 w-4" />
                            Settings
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-300 hover:text-white bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Domain Form */}
                    <div className="lg:col-span-1">
                        {/* Contact Info Reminder */}
                        <div className="mb-6 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-indigo-500/20 rounded-lg">
                                    <Settings className="h-5 w-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-indigo-200 mb-1">Update Contact Info</h3>
                                    <p className="text-sm text-indigo-200/70 mb-3">
                                        Don't forget to update your contact information in settings so buyers can reach you.
                                    </p>
                                    <Link
                                        href="/settings"
                                        className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                                    >
                                        Go to Settings <ExternalLink className="h-3 w-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 sticky top-8">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Plus className="h-5 w-5 text-amber-400" />
                                Add New Domain
                            </h2>

                            <form onSubmit={handleAddDomain} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Domain Name</label>
                                    <input
                                        type="text"
                                        value={newDomain.name}
                                        onChange={e => setNewDomain({ ...newDomain, name: e.target.value })}
                                        placeholder="example.com"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Price ($)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                        <input
                                            type="number"
                                            value={newDomain.price}
                                            onChange={e => setNewDomain({ ...newDomain, price: e.target.value })}
                                            placeholder="1000"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                            required
                                            min="0"
                                        />
                                    </div>
                                </div>

                                {addError && (
                                    <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                        {addError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isAdding}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                                >
                                    {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    Add Domain
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white/5 px-2 text-gray-500">Or Bulk Upload</span>
                                </div>
                            </div>

                            {/* Bulk Upload Form */}
                            <form onSubmit={handleBulkUpload} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Bulk Upload (max 500 domains)
                                    </label>
                                    <textarea
                                        value={bulkText}
                                        onChange={e => setBulkText(e.target.value)}
                                        placeholder={"example.com 1000\ntest.com 500\ndomain.com 2500"}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono text-sm min-h-[120px]"
                                        disabled={isAdding}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Format: domain.com price (one per line)</p>
                                </div>

                                {bulkError && (
                                    <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                        {bulkError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isAdding || !bulkText.trim()}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                                >
                                    {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    Upload Domains
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Domain List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Your Domains</h2>
                                <div className="flex items-center gap-2">
                                    {/* Filter Button */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowFilters(!showFilters)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeFiltersCount > 0
                                                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                                                : 'bg-white/10 hover:bg-white/20 text-white'
                                                }`}
                                        >
                                            <Filter className="h-4 w-4" />
                                            Filter
                                            {activeFiltersCount > 0 && (
                                                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                                    {activeFiltersCount}
                                                </span>
                                            )}
                                        </button>

                                        {/* Filter Dropdown Panel */}
                                        {showFilters && (
                                            <div className="absolute right-0 mt-2 w-80 bg-[#0A0A0A] border border-white/20 rounded-xl p-4 shadow-2xl z-50">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-semibold">Filters</h3>
                                                    {activeFiltersCount > 0 && (
                                                        <button
                                                            onClick={clearFilters}
                                                            className="text-xs text-amber-400 hover:text-amber-300"
                                                        >
                                                            Clear all
                                                        </button>
                                                    )}
                                                </div>

                                                {/* TLD Filter */}
                                                <div className="mb-4">
                                                    <label className="text-sm font-medium text-gray-300 mb-2 block">Extension (TLD)</label>
                                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                                        {uniqueTLDs.map(tld => (
                                                            <button
                                                                key={tld}
                                                                onClick={() => toggleTLD(tld)}
                                                                className={`px-3 py-1 rounded-lg text-sm transition-all ${selectedTLDs.has(tld)
                                                                    ? 'bg-amber-600 text-white'
                                                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                                                    }`}
                                                            >
                                                                .{tld}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Verification Status Filter */}
                                                <div className="mb-4">
                                                    <label className="text-sm font-medium text-gray-300 mb-2 block">Verification Status</label>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setVerificationFilter('all')}
                                                            className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${verificationFilter === 'all'
                                                                ? 'bg-amber-600 text-white'
                                                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                                                }`}
                                                        >
                                                            All
                                                        </button>
                                                        <button
                                                            onClick={() => setVerificationFilter('verified')}
                                                            className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${verificationFilter === 'verified'
                                                                ? 'bg-green-600 text-white'
                                                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                                                }`}
                                                        >
                                                            Verified
                                                        </button>
                                                        <button
                                                            onClick={() => setVerificationFilter('unverified')}
                                                            className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${verificationFilter === 'unverified'
                                                                ? 'bg-gray-600 text-white'
                                                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                                                }`}
                                                        >
                                                            Unverified
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Price Filter */}
                                                <div>
                                                    <label className="text-sm font-medium text-gray-300 mb-2 block">Price Range ($)</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="number"
                                                            placeholder="Min"
                                                            value={priceMin}
                                                            onChange={(e) => setPriceMin(e.target.value)}
                                                            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                                                        />
                                                        <span className="text-gray-500 self-center">-</span>
                                                        <input
                                                            type="number"
                                                            placeholder="Max"
                                                            value={priceMax}
                                                            onChange={(e) => setPriceMax(e.target.value)}
                                                            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Selection Mode */}
                                    {!isInSelectionMode ? (
                                        <button
                                            onClick={() => setIsInSelectionMode(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all"
                                        >
                                            <CheckSquare className="h-4 w-4" />
                                            Select
                                        </button>
                                    ) : (
                                        <>
                                            {selectedDomainIds.size > 0 && (
                                                <>
                                                    <button
                                                        onClick={handleBulkVerify}
                                                        disabled={isBulkVerifying}
                                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                                                    >
                                                        {isBulkVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                                        Verify Selected ({selectedDomainIds.size})
                                                    </button>
                                                    <button
                                                        onClick={handleBulkDelete}
                                                        disabled={isDeleting}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                                                    >
                                                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                        Delete Selected ({selectedDomainIds.size})
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setIsInSelectionMode(false);
                                                    setSelectedDomainIds(new Set());
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {filteredDomains.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    You haven't added any domains yet.
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {/* Select All Row - Only show in selection mode */}
                                    {isInSelectionMode && filteredDomains.length > 0 && (
                                        <div className="p-4 bg-white/5 flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedDomainIds.size > 0 && selectedDomainIds.size === filteredDomains.slice((currentPage - 1) * domainsPerPage, currentPage * domainsPerPage).length}
                                                onChange={toggleSelectAll}
                                                className="h-4 w-4 rounded border-white/20 bg-black/20 text-amber-500 focus:ring-amber-500/50"
                                            />
                                            <span className="text-sm text-gray-400">
                                                Select all on this page
                                            </span>
                                        </div>
                                    )}

                                    {filteredDomains.slice((currentPage - 1) * domainsPerPage, currentPage * domainsPerPage).map(domain => (
                                        <div key={domain.id} className="p-4 flex items-center gap-3 hover:bg-white/5 transition-colors">
                                            {isInSelectionMode && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDomainIds.has(domain.id)}
                                                    onChange={() => toggleSelectDomain(domain.id)}
                                                    className="h-4 w-4 rounded border-white/20 bg-black/20 text-amber-500 focus:ring-amber-500/50"
                                                />
                                            )}
                                            <div className="flex-1 flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className={`font-medium ${domain.status === 'sold' ? 'line-through text-gray-500' : 'text-white'}`}>
                                                            {domain.name}
                                                        </h3>
                                                        {domain.isVerified ? (
                                                            <div className="group relative">
                                                                <ShieldCheck className="h-4 w-4 text-green-400" />
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                                    Ownership Verified
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            domain.status !== 'sold' && (
                                                                <button
                                                                    onClick={() => openVerifyModal(domain)}
                                                                    className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded transition-colors"
                                                                >
                                                                    <Shield className="h-3 w-3" />
                                                                    Verify
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        Listed on {new Date(domain.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="font-mono text-white">
                                                            ${domain.price.toLocaleString()}
                                                        </div>
                                                        <button
                                                            onClick={() => handleToggleSold(domain.id, domain.status)}
                                                            className={`text-xs font-medium mt-1 ${domain.status === 'sold'
                                                                ? 'text-green-400 hover:text-green-300'
                                                                : 'text-amber-500 hover:text-amber-400'
                                                                }`}
                                                        >
                                                            {domain.status === 'sold' ? 'Mark Available' : 'Mark Sold'}
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => handleDeleteDomain(domain.id)}
                                                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Delete Domain"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {filteredDomains.length > 0 && (
                                <div className="p-4 border-t border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Show:</span>
                                        <select
                                            value={domainsPerPage}
                                            onChange={(e) => {
                                                setDomainsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            className="bg-black/20 border border-white/10 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-amber-500/50"
                                        >
                                            <option value="10">10 per page</option>
                                            <option value="50">50 per page</option>
                                            <option value="100">100 per page</option>
                                            <option value="200">200 per page</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:hover:text-gray-400 transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-sm text-gray-500">
                                            Page {currentPage} of {Math.ceil(filteredDomains.length / domainsPerPage)}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredDomains.length / domainsPerPage), p + 1))}
                                            disabled={currentPage >= Math.ceil(filteredDomains.length / domainsPerPage)}
                                            className="px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:hover:text-gray-400 transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Verification Modal */}
            {showVerifyModal && selectedDomain && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowVerifyModal(false)}>
                    <div className="bg-[#0A0A0A] border border-white/20 rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                            <ShieldCheck className="h-6 w-6 text-amber-400" />
                            Verify Domain Ownership
                        </h3>

                        <p className="text-gray-300 text-sm mb-6">
                            To verify ownership of <span className="font-bold text-white">{selectedDomain.name}</span>, choose one of the verification methods below. <span className="text-amber-400 font-medium">NS verification is recommended</span> for instant results.
                        </p>

                        <div
                            className={`bg-white/5 border rounded-lg p-4 mb-6 cursor-pointer transition-colors ${activeMethod === 'txt' ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10 hover:border-white/20'}`}
                            onClick={() => setActiveMethod(activeMethod === 'txt' ? null : 'txt')}
                        >
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Record Type</span>
                                <span>Host / Name</span>
                            </div>
                            <div className="flex justify-between text-sm text-white font-mono mb-4">
                                <span>TXT</span>
                                <span>@</span>
                            </div>

                            <div className="text-xs text-gray-500 mb-1">Value / Content</div>
                            <div className="flex items-center gap-2 bg-black/40 rounded p-2 border border-white/10">
                                <code className="text-sm text-amber-400 font-mono flex-1 truncate">
                                    domainliq-verification={selectedDomain.verificationToken || 'Loading...'}
                                </code>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        selectedDomain.verificationToken && copyToClipboard(`domainliq-verification=${selectedDomain.verificationToken}`);
                                    }}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    {copiedToken ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>

                            {activeMethod === 'txt' && (
                                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-200 animate-in fade-in slide-in-from-top-2">
                                    <p className="font-medium mb-1">How to verify with TXT:</p>
                                    <p className="mb-1">Go to your domain registrar's DNS settings and add a new TXT record with the value above.</p>
                                    <p className="text-amber-400/80">⏱️ Verification typically takes 5-15 minutes after DNS propagation.</p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4 my-4">
                            <div className="h-px bg-white/10 flex-1" />
                            <span className="text-gray-500 text-sm">OR</span>
                            <div className="h-px bg-white/10 flex-1" />
                        </div>

                        <div
                            className={`bg-white/5 border rounded-lg p-4 mb-6 cursor-pointer transition-colors ${activeMethod === 'ns' ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10 hover:border-white/20'}`}
                            onClick={() => setActiveMethod(activeMethod === 'ns' ? null : 'ns')}
                        >
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Record Type</span>
                                <span>Host / Name</span>
                            </div>
                            <div className="flex justify-between text-sm text-white font-mono mb-4">
                                <span>NS</span>
                                <span>@</span>
                            </div>

                            <div className="text-xs text-gray-500 mb-1">Value / Content</div>
                            <div className="flex items-center gap-2 bg-black/40 rounded p-2 border border-white/10">
                                <code className="text-sm text-amber-400 font-mono flex-1 truncate">
                                    ns3verify.domainliq.com
                                </code>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard('ns3verify.domainliq.com');
                                    }}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    {copiedToken ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>

                            {activeMethod === 'ns' && (
                                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-200 animate-in fade-in slide-in-from-top-2">
                                    <p className="font-medium mb-1">✨ Recommended: Fastest Verification!</p>
                                    <p className="mb-2">Add this as an <strong>additional nameserver (e.g., NS3)</strong> to your existing list. <br />Do <strong>NOT</strong> remove your current nameservers (NS1, NS2) to keep your landing page working.</p>
                                    <p className="text-green-400 font-medium">⚡️ Verifies within minutes once your registrar updates the registry!</p>
                                </div>
                            )}
                        </div>

                        {verificationMessage && (
                            <div className={`mb-4 p-3 rounded-lg text-sm ${verificationStatus === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {verificationMessage}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowVerifyModal(false)}
                                className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleVerifyDomain}
                                disabled={verificationStatus === 'loading' || verificationStatus === 'success'}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                            >
                                {verificationStatus === 'loading' ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Checking...
                                    </>
                                ) : verificationStatus === 'success' ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Verified
                                    </>
                                ) : (
                                    'Check Now'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
