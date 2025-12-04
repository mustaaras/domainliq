'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
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
        <div className="min-h-screen dark:bg-[#050505] bg-gray-50 dark:text-white text-gray-900 p-4 md:p-6 lg:p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">
                <DashboardHeader />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Custom Domains</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
                            Connect your domains to your profile.
                            <span className="block text-xs text-gray-400 dark:text-gray-500 mt-1">
                                For listing domains for sale only, use the main Dashboard.
                            </span>
                        </p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 active:scale-95"
                    >
                        <Plus className="h-5 w-5" />
                        Connect Domain
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-220px)] lg:min-h-[600px]">
                    {/* Left Panel: Domain List */}
                    <div className="lg:col-span-4 flex flex-col bg-white dark:bg-[#111] border dark:border-white/10 rounded-2xl overflow-hidden shadow-sm h-[400px] lg:h-auto">
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

                        {/* Scrollable List */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {isLoading ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                                </div>
                            ) : filteredDomains.length === 0 ? (
                                <div className="text-center p-8 text-gray-500 dark:text-gray-400 text-sm">
                                    {searchQuery ? 'No matching domains found.' : 'No domains connected.'}
                                </div>
                            ) : (
                                paginatedDomains.map(domain => (
                                    <div
                                        key={domain.id}
                                        onClick={() => {
                                            setSelectedDomain(domain);
                                            setVerificationResult(null);
                                        }}
                                        className={`group p-3 rounded-xl cursor-pointer transition-all border ${selectedDomain?.id === domain.id
                                            ? 'border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-sm'
                                            : 'border-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className={`font-medium truncate transition-colors ${selectedDomain?.id === domain.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200'}`}>
                                                {domain.name}
                                            </h3>
                                            <ChevronRight className={`h-4 w-4 text-gray-300 dark:text-gray-600 transition-transform ${selectedDomain?.id === domain.id ? 'translate-x-1 text-indigo-400' : ''}`} />
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* Verification Badge */}
                                            {domain.isVerified ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30">
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                                                    Not Verified
                                                </span>
                                            )}

                                            {/* Connection Badge */}
                                            {(domain.isVerified && (domain.verificationMethod === 'a' || domain.verificationMethod === 'redirect')) ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30">
                                                    Connected
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10">
                                                    Not Connected
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {filteredDomains.length > itemsPerPage && (
                            <div className="p-3 border-t dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex items-center justify-between text-xs">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <span className="text-gray-500 dark:text-gray-400 font-medium">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Details */}
                    <div className="lg:col-span-8 flex flex-col h-full">
                        {selectedDomain ? (
                            <div className="bg-white dark:bg-[#111] border dark:border-white/10 rounded-2xl p-6 h-full overflow-y-auto shadow-sm animate-in fade-in duration-300">
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

                                    {/* Actions could go here */}
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
                                    <div className="space-y-6 max-w-2xl">
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
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border dark:border-white/10 rounded-2xl bg-gray-50/50 dark:bg-[#111]/50 border-dashed">
                                <div className="p-6 bg-white dark:bg-white/5 rounded-full mb-4 shadow-sm">
                                    <ExternalLink className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Select a Domain</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-xs mt-2 leading-relaxed">
                                    Choose a domain from the list on the left to view its status and configuration settings.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
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
