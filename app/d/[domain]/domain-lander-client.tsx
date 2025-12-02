'use client';

import { useState } from 'react';
import { ShieldCheck, ExternalLink, Edit2, Wand2, Save, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface DomainLanderClientProps {
    domain: any;
    isOwner: boolean;
}

export default function DomainLanderClient({ domain, isOwner }: DomainLanderClientProps) {
    const [content, setContent] = useState(domain.content || '');
    const [isEditing, setIsEditing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showEscrowModal, setShowEscrowModal] = useState(false);

    const handleGenerateAI = async () => {
        try {
            setIsGenerating(true);
            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: domain.name }),
            });
            const data = await res.json();
            if (data.content) {
                setContent(data.content);
                setIsEditing(true); // Switch to edit mode to review
            }
        } catch (error) {
            console.error('Failed to generate AI content:', error);
            alert('Failed to generate content. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const res = await fetch(`/api/domains/${domain.id}/content`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            });

            if (!res.ok) throw new Error('Failed to save');

            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save content:', error);
            alert('Failed to save content.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500/30 pb-20">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 to-transparent pt-20 pb-16 md:pt-32 md:pb-24">
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-6 tracking-tight">
                        {domain.name}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 mb-8 font-light">
                        is available for purchase
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-12">
                        <div className="text-3xl md:text-4xl font-bold text-amber-500">
                            ${domain.price.toLocaleString()}
                        </div>
                        {domain.isVerified && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium">
                                <ShieldCheck className="w-4 h-4" />
                                Verified Domain
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {domain.price >= 500 && domain.isVerified && domain.user.escrowEmail && (
                            <button
                                onClick={() => setShowEscrowModal(true)}
                                className="w-full sm:w-auto px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                            >
                                <ShieldCheck className="w-5 h-5" />
                                Buy Securely with Escrow.com
                            </button>
                        )}
                        <button
                            onClick={() => window.location.href = `mailto:${domain.user.contactEmail || domain.user.email}?subject=Inquiry about ${domain.name}`}
                            className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-amber-900/20"
                        >
                            Contact Owner
                        </button>
                    </div>
                </div>

                {/* Background Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[120px] -z-10" />
            </div>

            {/* Content Section */}
            <div className="max-w-3xl mx-auto px-4 mt-12">
                {isOwner && (
                    <div className="mb-8 flex gap-2 justify-end">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit Content
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleGenerateAI}
                                    disabled={isGenerating}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    <Wand2 className="w-4 h-4" />
                                    {isGenerating ? 'Generating...' : 'Generate with AI'}
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {isEditing ? (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-[500px] bg-black/40 border border-white/10 rounded-xl p-6 text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500/50 font-mono"
                        placeholder="Enter your domain description here... Markdown is supported."
                    />
                ) : (
                    <div className="prose prose-invert prose-lg max-w-none">
                        {content ? (
                            <ReactMarkdown>{content}</ReactMarkdown>
                        ) : (
                            <div className="text-center py-12 text-gray-600 border border-dashed border-white/10 rounded-xl">
                                <p>No description available for this domain.</p>
                                {isOwner && (
                                    <p className="text-sm mt-2">Click "Edit Content" to add a description or generate one with AI.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Escrow Modal */}
            {showEscrowModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEscrowModal(false)}>
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center border border-green-500/20">
                                <ShieldCheck className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Buy with Escrow.com</h3>
                                <p className="text-xs text-gray-400">Secure transaction for {domain.name}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                                <p className="text-sm text-gray-300 mb-2">
                                    This domain is listed for <span className="text-white font-bold">${domain.price.toLocaleString()}</span>.
                                </p>
                                <p className="text-sm text-gray-400">
                                    Enter your email address to start a secure transaction on Escrow.com. You will be redirected to complete the purchase.
                                </p>
                            </div>

                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const form = e.target as HTMLFormElement;
                                    const email = (form.elements.namedItem('buyerEmail') as HTMLInputElement).value;
                                    const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
                                    const originalText = btn.innerHTML;

                                    try {
                                        btn.disabled = true;
                                        btn.innerHTML = '<span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span> Processing...';

                                        const res = await fetch('/api/escrow/create-transaction', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                domain: domain.name,
                                                price: domain.price,
                                                buyerEmail: email,
                                                sellerEmail: domain.user.escrowEmail
                                            })
                                        });

                                        const data = await res.json();

                                        if (!res.ok) throw new Error(data.error || 'Failed to start transaction');

                                        if (data.landing_page) {
                                            window.location.href = data.landing_page;
                                        } else {
                                            throw new Error('No redirect URL received');
                                        }

                                    } catch (error: any) {
                                        alert(error.message);
                                        btn.disabled = false;
                                        btn.innerHTML = originalText;
                                    }
                                }}
                            >
                                <div className="mb-4">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Your Email Address</label>
                                    <input
                                        type="email"
                                        name="buyerEmail"
                                        required
                                        placeholder="you@example.com"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-green-500/50"
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        type="submit"
                                        className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        Start Secure Transaction
                                        <ExternalLink className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowEscrowModal(false)}
                                        className="w-full py-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
