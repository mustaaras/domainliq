'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Plus, Trash2, Settings, ExternalLink, DollarSign, LogOut, Shield, ShieldCheck, Copy, Check } from 'lucide-react';
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
    const [copiedToken, setCopiedToken] = useState(false);

    // New domain form state
    const [newDomain, setNewDomain] = useState({ name: '', price: '' });
    const [addError, setAddError] = useState('');

    // Bulk upload state
    const [bulkText, setBulkText] = useState('');
    const [bulkError, setBulkError] = useState('');

    // User subdomain for profile link
    const [userSubdomain, setUserSubdomain] = useState('');

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
            if (lines.length > 50) {
                throw new Error('Maximum 50 domains per bulk upload');
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

            // Add all domains
            const results = [];
            for (const domain of domainsToAdd) {
                const res = await fetch('/api/user/domains', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(domain)
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || `Failed to add ${domain.name}`);
                }

                const addedDomain = await res.json();
                results.push(addedDomain);
            }

            setDomains([...results, ...domains]);
            setBulkText('');
            setAddError('');
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

    const handleDeleteDomain = async (id: string) => {
        if (!confirm('Are you sure you want to delete this domain?')) return;

        try {
            const res = await fetch(`/api/user/domains/${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to delete domain');

            setDomains(domains.filter(d => d.id !== id));
        } catch (error) {
            console.error(error);
            alert('Failed to delete domain');
        }
    };

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

    const openVerifyModal = (domain: Domain) => {
        setSelectedDomain(domain);
        setVerificationStatus('idle');
        setVerificationMessage('');
        setShowVerifyModal(true);
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
                                        Bulk Upload (max 50 domains)
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
                            <div className="p-6 border-b border-white/10">
                                <h2 className="text-xl font-semibold">Your Domains</h2>
                            </div>

                            {domains.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    You haven't added any domains yet.
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {domains.map(domain => (
                                        <div key={domain.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
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
                                    ))}
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
                            To verify ownership of <span className="font-bold text-white">{selectedDomain.name}</span>, please add the following TXT record to your DNS settings.
                        </p>

                        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
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
                                    {selectedDomain.verificationToken || 'Loading token...'}
                                </code>
                                <button
                                    onClick={() => selectedDomain.verificationToken && copyToClipboard(selectedDomain.verificationToken)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    {copiedToken ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
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
