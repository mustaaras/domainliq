'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Plus, Trash2, Settings, ExternalLink, DollarSign, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

interface Domain {
    id: string;
    name: string;
    price: number;
    status: string;
    createdAt: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const sessionData = useSession();
    const { data: session, status } = sessionData || {};

    const [domains, setDomains] = useState<Domain[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // New domain form state
    const [newDomain, setNewDomain] = useState({ name: '', price: '' });
    const [addError, setAddError] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated') {
            fetchUserDomains();
        }
    }, [status, router]);

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
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <ExternalLink className="h-4 w-4" />
                            View Site
                        </Link>
                        <Link
                            href="/settings"
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Settings className="h-4 w-4" />
                            Settings
                        </Link>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 rounded-lg transition-colors flex items-center gap-2"
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
                                <Plus className="h-5 w-5 text-indigo-400" />
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
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
                                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                                >
                                    {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    Add Domain
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
                                                <div className="font-medium text-lg text-white">{domain.name}</div>
                                                <div className="text-sm text-gray-400">
                                                    Listed for <span className="text-indigo-400">${domain.price.toLocaleString()}</span>
                                                    <span className="mx-2">•</span>
                                                    <span className={`capitalize ${domain.status === 'sold' ? 'text-red-400' : 'text-green-400'}`}>
                                                        {domain.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleDeleteDomain(domain.id)}
                                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Delete Domain"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
