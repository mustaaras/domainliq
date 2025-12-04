'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Plus, Loader2, Check, AlertTriangle, ExternalLink, Trash2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { AddCustomDomainModal } from '@/components/add-custom-domain-modal';
import { DomainSetupInstructions } from '@/components/domain-setup-instructions';
import { verifyRedirect } from '@/app/actions/verify-redirect';
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
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [activeTab, setActiveTab] = useState<'redirect' | 'arecord'>('redirect');
    const [verificationResult, setVerificationResult] = useState<{ success?: boolean; error?: string } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchDomains = async () => {
        try {
            const res = await fetch('/api/user/domains');
            if (res.ok) {
                const data = await res.json();
                setDomains(data);
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

    const handleVerify = async () => {
        if (!selectedDomain) return;

        setIsVerifying(true);
        setVerificationResult(null);

        try {
            if (activeTab === 'redirect') {
                // Try Redirect verification
                const redirectRes = await verifyRedirect(selectedDomain.id);
                if (redirectRes.success) {
                    setVerificationResult({ success: true });
                    fetchDomains(); // Refresh list
                    return;
                }
                setVerificationResult({
                    error: redirectRes.error || 'Redirect not found. Please ensure you have set up a 301 redirect to https://domainliq.com/d/' + selectedDomain.name
                });
            } else if (activeTab === 'arecord') {
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
            }

        } catch (error) {
            setVerificationResult({ error: 'An unexpected error occurred.' });
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="min-h-screen dark:bg-[#050505] bg-gray-50 dark:text-white text-gray-900 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <DashboardHeader />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Custom Domains</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Connect your existing domains to DomainLiq.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Add Domain
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Domain List */}
                    <div className="lg:col-span-1 space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                            </div>
                        ) : domains.length === 0 ? (
                            <div className="text-center p-8 border dark:border-white/10 rounded-xl bg-white dark:bg-[#111]">
                                <p className="text-gray-500 dark:text-gray-400">No domains added yet.</p>
                            </div>
                        ) : (
                            <>
                                {domains
                                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                    .map(domain => (
                                        <div
                                            key={domain.id}
                                            onClick={() => {
                                                setSelectedDomain(domain);
                                                setVerificationResult(null);
                                                setActiveTab('redirect'); // Reset tab when changing domain
                                            }}
                                            className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedDomain?.id === domain.id
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 ring-1 ring-indigo-500'
                                                : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] hover:border-indigo-300 dark:hover:border-indigo-700'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-medium truncate">{domain.name}</h3>
                                                {domain.isVerified ? (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full flex items-center gap-1">
                                                        <Check className="h-3 w-3" />
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full flex items-center gap-1">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Unverified
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                {domain.verificationMethod ? (
                                                    <span className="uppercase">{domain.verificationMethod}</span>
                                                ) : (
                                                    <span>Setup Required</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                {/* Pagination Controls */}
                                {domains.length > itemsPerPage && (
                                    <div className="flex items-center justify-between pt-4 border-t dark:border-white/10">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Page {currentPage} of {Math.ceil(domains.length / itemsPerPage)}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(Math.ceil(domains.length / itemsPerPage), p + 1))}
                                            disabled={currentPage === Math.ceil(domains.length / itemsPerPage)}
                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Setup/Details Panel */}
                    <div className="lg:col-span-2">
                        {selectedDomain ? (
                            <div className="bg-white dark:bg-[#111] border dark:border-white/10 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold">{selectedDomain.name}</h3>
                                    <div className="flex gap-2">
                                        <a
                                            href={`https://${selectedDomain.name}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                            title="Visit Site"
                                        >
                                            <ExternalLink className="h-5 w-5" />
                                        </a>
                                    </div>
                                </div>

                                {selectedDomain.isVerified && (selectedDomain.verificationMethod === 'redirect' || selectedDomain.verificationMethod === 'a' || selectedDomain.verificationMethod === 'ns') ? (
                                    <div className="space-y-6">
                                        <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-lg p-4 flex items-start gap-3">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                                                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-green-900 dark:text-green-200">Domain Connected Successfully</h4>
                                                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                                    Your domain is active and pointing to DomainLiq.
                                                    {selectedDomain.verificationMethod === 'redirect' && ' (via Redirect)'}
                                                    {selectedDomain.verificationMethod === 'a' && ' (via A Record)'}
                                                    {selectedDomain.verificationMethod === 'ns' && ' (via Nameservers)'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t dark:border-white/10">
                                            <h4 className="font-medium mb-2">Configuration</h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="block text-gray-500 dark:text-gray-400">Status</span>
                                                    <span className="font-medium text-green-600 dark:text-green-400">Active</span>
                                                </div>
                                                <div>
                                                    <span className="block text-gray-500 dark:text-gray-400">Method</span>
                                                    <span className="font-medium uppercase">{selectedDomain.verificationMethod}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Show Ownership Status if verified via TXT/NS */}
                                        {selectedDomain.isVerified && (
                                            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg p-4 flex items-start gap-3">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                                                    <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-blue-900 dark:text-blue-200">Ownership Verified</h4>
                                                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                                        You have proved ownership of this domain. Now, please configure the connection below to make it live.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {verificationResult?.error && (
                                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg p-4 text-sm text-red-600 dark:text-red-400">
                                                {verificationResult.error}
                                            </div>
                                        )}

                                        {verificationResult?.success && (
                                            <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-lg p-4 text-sm text-green-600 dark:text-green-400">
                                                Connection verification successful!
                                            </div>
                                        )}

                                        <DomainSetupInstructions
                                            domainName={selectedDomain.name}
                                            onVerify={handleVerify}
                                            isVerifying={isVerifying}
                                            activeTab={activeTab}
                                            onTabChange={setActiveTab}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 border dark:border-white/10 rounded-xl bg-gray-50 dark:bg-[#111]/50 border-dashed">
                                <div className="p-4 bg-gray-100 dark:bg-white/5 rounded-full mb-4">
                                    <ExternalLink className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Select a Domain</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-sm mt-2">
                                    Select a domain from the list to view setup instructions or verify connection.
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
