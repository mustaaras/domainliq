'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2, Check, AlertTriangle, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { AddCustomDomainModal } from '@/components/add-custom-domain-modal';
import { DomainSetupInstructions } from '@/components/domain-setup-instructions';
import { verifyDomain } from '@/app/actions/verify-domain';

interface Domain {
    id: string;
    name: string;
    isVerified: boolean;
    verificationMethod: string | null;
    status: string;
}

export default function CustomDomainsPage() {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [filteredDomains, setFilteredDomains] = useState<Domain[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<{ success?: boolean; error?: string } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchDomains = async () => {
        try {
            const res = await fetch('/api/user/domains');
            if (res.ok) {
                const data = await res.json();
                setDomains(data);
                setFilteredDomains(data);
            }
        } catch (error) {
            console.error('Failed to fetch domains:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDomains();
    }, []);

    useEffect(() => {
        const filtered = domains.filter(d =>
            d.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredDomains(filtered);
        setCurrentPage(1); // Reset to first page on search
    }, [searchQuery, domains]);

    const handleVerify = async () => {
        if (!selectedDomain) return;

        setIsVerifying(true);
        setVerificationResult(null);

        try {
            // Try A Record verification
            const aRecordRes = await verifyDomain(selectedDomain.id);
            if (aRecordRes.success) {
                setVerificationResult({ success: true });
                fetchDomains(); // Refresh list
                return;
            }
            setVerificationResult({
                error: aRecordRes.error || 'A Record not found or incorrect. Please check your DNS settings.'
            });

        } catch (error) {
            setVerificationResult({ error: 'An unexpected error occurred.' });
        } finally {
            setIsVerifying(false);
        }
    };

    const totalPages = Math.ceil(filteredDomains.length / itemsPerPage);
    const paginatedDomains = filteredDomains.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6 font-sans h-full">
            <div className="space-y-6">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Custom Domains</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                            Connect your domains to your domain landers.
                        </p>
                    </div>
                    {!selectedDomain && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Connect Domain
                        </button>
                    )}
                </div>

                {selectedDomain ? (
                    // DETAIL VIEW
                    <div className="bg-white dark:bg-[#111] border dark:border-white/10 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
                        <button
                            onClick={() => setSelectedDomain(null)}
                            className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back to Domains
                        </button>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b dark:border-white/10">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedDomain.name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full flex items-center gap-1.5 ${selectedDomain.isVerified
                                        ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                                        : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                        }`}>
                                        {selectedDomain.isVerified ? (
                                            <><Check className="h-3 w-3" /> Verified</>
                                        ) : (
                                            <><AlertTriangle className="h-3 w-3" /> Unverified</>
                                        )}
                                    </span>
                                    <a
                                        href={`https://${selectedDomain.name}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
                                    >
                                        Visit <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {(selectedDomain.isVerified && (selectedDomain.verificationMethod === 'a' || selectedDomain.verificationMethod === 'redirect')) ? (
                            <div className="space-y-6">
                                <div className="bg-green-50 dark:bg-green-500/5 border border-green-100 dark:border-green-500/10 rounded-xl p-5 flex gap-4">
                                    <div className="p-3 bg-green-100 dark:bg-green-500/20 rounded-full h-fit">
                                        <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-green-900 dark:text-green-200 text-lg">All Systems Go</h4>
                                        <p className="text-green-700 dark:text-green-300 mt-1 leading-relaxed">
                                            Your domain is actively connected to your DomainLiq profile.
                                            SSL certificates are automatically managed.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border dark:border-white/5">
                                        <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Connection Type</span>
                                        <p className="mt-1 font-mono text-lg">{selectedDomain.verificationMethod?.toUpperCase() || 'A RECORD'}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border dark:border-white/5">
                                        <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Status</span>
                                        <p className="mt-1 text-lg text-green-600 dark:text-green-400 font-medium">Active</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 max-w-3xl">
                                {verificationResult?.error && (
                                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-600 dark:text-red-400">
                                        <AlertTriangle className="h-5 w-5 shrink-0" />
                                        <p className="text-sm font-medium">{verificationResult.error}</p>
                                    </div>
                                )}

                                {verificationResult?.success && (
                                    <div className="bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 rounded-xl p-4 flex items-center gap-3 text-green-600 dark:text-green-400">
                                        <Check className="h-5 w-5 shrink-0" />
                                        <p className="text-sm font-medium">Domain verified successfully!</p>
                                    </div>
                                )}

                                <DomainSetupInstructions
                                    domainName={selectedDomain.name}
                                    onVerify={handleVerify}
                                    isVerifying={isVerifying}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    // LIST VIEW
                    <div className="bg-white dark:bg-[#111] border dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                        {/* Search Bar */}
                        <div className="p-4 border-b dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
                            <input
                                type="text"
                                placeholder="Search domains..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all"
                            />
                        </div>

                        {/* List */}
                        <div className="divide-y dark:divide-white/10">
                            {isLoading ? (
                                <div className="flex justify-center p-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                                </div>
                            ) : filteredDomains.length === 0 ? (
                                <div className="text-center p-12">
                                    <div className="mx-auto h-12 w-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <ExternalLink className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">No domains found</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {searchQuery ? 'Try adjusting your search terms.' : 'Get started by connecting a domain.'}
                                    </p>
                                    {!searchQuery && (
                                        <button
                                            onClick={() => setIsAddModalOpen(true)}
                                            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                                        >
                                            Connect Domain
                                        </button>
                                    )}
                                </div>
                            ) : (
                                paginatedDomains.map(domain => (
                                    <div
                                        key={domain.id}
                                        onClick={() => {
                                            setSelectedDomain(domain);
                                            setVerificationResult(null);
                                        }}
                                        className="group p-4 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors flex items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-gray-100 dark:bg-white/5 rounded-lg text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                <ExternalLink className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {domain.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {domain.isVerified ? (
                                                        <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                                            <Check className="h-3 w-3" /> Verified
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                                            <AlertTriangle className="h-3 w-3" /> Unverified
                                                        </span>
                                                    )}
                                                    <span className="text-gray-300 dark:text-gray-600">•</span>
                                                    {(domain.isVerified && (domain.verificationMethod === 'a' || domain.verificationMethod === 'redirect')) ? (
                                                        <span className="text-xs text-green-600 dark:text-green-400">Connected</span>
                                                    ) : (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">Not Connected</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors" />
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {filteredDomains.length > itemsPerPage && (
                            <div className="p-3 border-t dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex items-center justify-between text-xs">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(1, p - 1)); }}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <span className="text-gray-500 dark:text-gray-400 font-medium">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <AddCustomDomainModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    fetchDomains();
                    setIsAddModalOpen(false);
                }}
            />
        </div>
    );
}
