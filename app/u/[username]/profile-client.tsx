'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Check, ShieldCheck } from 'lucide-react';

interface Domain {
    id: string;
    name: string;
    price: number;
    status: string;
    isVerified?: boolean;
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
    domains: Domain[];
    username: string;
}

export default function ProfileClient({ user, domains, username }: ProfileClientProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showContactModal, setShowContactModal] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);

    // Get available contact methods
    const availableMethods = [
        user.contactEmail && { type: 'email', label: 'Email', value: user.contactEmail },
        user.twitterHandle && { type: 'twitter', label: 'X / Twitter', value: user.twitterHandle },
        user.whatsappNumber && { type: 'whatsapp', label: 'WhatsApp', value: user.whatsappNumber },
        user.linkedinProfile && { type: 'linkedin', label: 'LinkedIn', value: user.linkedinProfile },
        user.telegramUsername && { type: 'telegram', label: 'Telegram', value: user.telegramUsername },
    ].filter(Boolean) as Array<{ type: string; label: string; value: string }>;

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleContact = async () => {
        // Check if user has accepted terms
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

        // If multiple contact methods available, show modal
        if (availableMethods.length > 1) {
            setShowContactModal(true);
        } else if (availableMethods.length === 1) {
            // Directly contact using the only available method
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
                } else {
                    alert("Seller hasn't provided their X handle yet.");
                }
                break;

            case 'whatsapp':
                if (user.whatsappNumber) {
                    const encodedMessage = encodeURIComponent(message);
                    window.open(`https://wa.me/${user.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`, '_blank');
                } else {
                    alert("Seller hasn't provided their WhatsApp number yet.");
                }
                break;

            case 'linkedin':
                if (user.linkedinProfile) {
                    await navigator.clipboard.writeText(message);
                    window.open(user.linkedinProfile, '_blank');
                } else {
                    alert("Seller hasn't provided their LinkedIn profile yet.");
                }
                break;

            case 'telegram':
                if (user.telegramUsername) {
                    const encodedMessage = encodeURIComponent(message);
                    window.open(`https://t.me/${user.telegramUsername}?text=${encodedMessage}`, '_blank');
                } else {
                    alert("Seller hasn't provided their Telegram username yet.");
                }
                break;

            default: // email
                const email = user.contactEmail;
                if (email) {
                    const subject = encodeURIComponent('Domain Inquiry');
                    const body = encodeURIComponent(message);
                    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
                } else {
                    alert("Seller hasn't provided their contact email yet.");
                }
                break;
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1);
    };

    // Calculate pagination
    const totalDomains = domains.length;
    const totalPages = Math.ceil(totalDomains / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalDomains);
    const currentDomains = domains.slice(startIndex, endIndex);

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500/30">
            <div className="max-w-3xl mx-auto px-4 py-8 pb-32 md:pb-12">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex justify-center mb-6">
                        <Link href="/">
                            <img src="/logo.svg" alt="DomainLiq" className="h-8 w-auto cursor-pointer" />
                        </Link>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                        <div className="text-center md:text-left w-full md:w-auto">
                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                {user.name || username}'s Domains
                            </h1>
                            <p className="text-gray-500 mt-1">Domain Liquidation Listing Platform</p>
                        </div>
                    </div>
                </header>

                {/* Controls */}
                <div className="mb-6 flex justify-end">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Show:</span>
                        <select
                            value={itemsPerPage}
                            onChange={handleLimitChange}
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                        >
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={200}>200</option>
                        </select>
                    </div>
                </div>

                {/* List */}
                <div className="flex flex-col gap-2">
                    {domains.length > 0 ? (
                        <>
                            {currentDomains.map((domain) => (
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
                            ))}

                            {/* Pagination Controls */}
                            {totalDomains > 0 && (
                                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4">
                                    <div className="text-sm text-gray-400">
                                        Showing <span className="font-medium text-white">{startIndex + 1}</span> to <span className="font-medium text-white">{endIndex}</span> of <span className="font-medium text-white">{totalDomains}</span> results
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage >= totalPages}
                                            className="px-3 py-1 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12 text-gray-600">
                            No domains listed yet.
                        </div>
                    )}
                </div>
            </div>



            {/* Floating Contact Button */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pointer-events-none">
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
