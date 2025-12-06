'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, ExternalLink, Edit2, Wand2, Save, X, Check, Globe, Zap, Lock, ChevronDown, ChevronUp, ArrowRight, Star, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Logo } from '@/components/logo';
import { ChatWidget } from '@/components/chat-widget';

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
    const [showContactModal, setShowContactModal] = useState(false);

    // Get available contact methods
    const availableMethods = [
        domain.user.contactEmail && { type: 'email', label: 'Email', value: domain.user.contactEmail },
        domain.user.twitterHandle && { type: 'twitter', label: 'X / Twitter', value: domain.user.twitterHandle },
        domain.user.whatsappNumber && { type: 'whatsapp', label: 'WhatsApp', value: domain.user.whatsappNumber },
        domain.user.linkedinProfile && { type: 'linkedin', label: 'LinkedIn', value: domain.user.linkedinProfile },
        domain.user.telegramUsername && { type: 'telegram', label: 'Telegram', value: domain.user.telegramUsername },
    ].filter(Boolean) as Array<{ type: string; label: string; value: string }>;

    const handleContact = () => {
        if (availableMethods.length > 1) {
            setShowContactModal(true);
        } else if (availableMethods.length === 1) {
            contactViaMethod(availableMethods[0].type);
        } else {
            // Fallback to default email if nothing else (shouldn't happen if logic is correct, but good for safety)
            window.location.href = `mailto:${domain.user.contactEmail || domain.user.email}?subject=Inquiry about ${domain.name}`;
        }
    };

    const contactViaMethod = async (method: string) => {
        const message = `Hi, I'm interested in the domain: ${domain.name}`;

        switch (method) {
            case 'twitter':
                if (domain.user.twitterHandle) {
                    await navigator.clipboard.writeText(message);
                    window.open(`https://x.com/messages/compose?recipient=${domain.user.twitterHandle}`, '_blank');
                }
                break;
            case 'whatsapp':
                if (domain.user.whatsappNumber) {
                    const encodedMessage = encodeURIComponent(message);
                    window.open(`https://wa.me/${domain.user.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`, '_blank');
                }
                break;
            case 'linkedin':
                if (domain.user.linkedinProfile) {
                    await navigator.clipboard.writeText(message);
                    window.open(domain.user.linkedinProfile, '_blank');
                }
                break;
            case 'telegram':
                if (domain.user.telegramUsername) {
                    const encodedMessage = encodeURIComponent(message);
                    window.open(`https://t.me/${domain.user.telegramUsername}?text=${encodedMessage}`, '_blank');
                }
                break;
            default: // email
                const email = domain.user.contactEmail || domain.user.email;
                if (email) {
                    const subject = encodeURIComponent(`Inquiry about ${domain.name}`);
                    const body = encodeURIComponent(message);
                    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
                }
                break;
        }
    };

    // Track view
    useEffect(() => {
        const trackView = async () => {
            try {
                await fetch('/api/health/ping', {
                    method: 'POST',
                    body: JSON.stringify({ domainName: domain.name })
                });
            } catch (e) {
                // Ignore tracking errors
            }
        };
        trackView();
    }, [domain.name]);

    // AI Generation Logic
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
                setIsEditing(true);
            }
        } catch (error) {
            console.error('Failed to generate AI content:', error);
            alert('Failed to generate content. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Save Logic
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
        <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-white font-sans selection:bg-amber-500/30">
            {/* Navigation */}
            <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href="/">
                        <Logo className="h-8 w-auto" />
                    </Link>
                    {isOwner && (
                        <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-xs font-medium">
                            Owner View
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                {/* Background - Premium Gradient Flow & Deep Space */}
                <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
                    {/* Dark Mode: Starfield Texture */}
                    <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-1000 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />

                    {/* Top Center Glow - Amber */}
                    <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-amber-100/40 to-transparent dark:from-amber-500/10 dark:to-transparent blur-[80px] dark:blur-[100px]" />

                    {/* Left Side - Deep Blue Nebula */}
                    <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-blue-50/50 dark:bg-indigo-500/10 rounded-full blur-[100px] dark:mix-blend-screen animate-pulse duration-[4000ms]" />

                    {/* Right Side - Deep Blue/Cyan Nebula */}
                    <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-orange-50/50 dark:bg-cyan-500/10 rounded-full blur-[100px] dark:mix-blend-screen animate-pulse duration-[5000ms]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-white/5 border border-amber-200 dark:border-amber-500/20 shadow-sm mb-8 backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-sm font-semibold text-amber-700 dark:text-amber-400 tracking-wide uppercase text-[11px]">Liquidation Listing</span>
                    </div>

                    <h1 className={`
                        font-black tracking-tight mb-6 break-words text-gray-900 dark:text-white drop-shadow-sm px-2
                        ${domain.name.length > 20
                            ? 'text-xl sm:text-5xl md:text-6xl lg:text-6xl'
                            : domain.name.length > 14
                                ? 'text-2xl sm:text-6xl md:text-7xl lg:text-7xl'
                                : 'text-4xl sm:text-7xl md:text-8xl lg:text-8xl'}
                    `}>
                        {domain.name}
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 font-light max-w-2xl mx-auto leading-relaxed">
                        Acquire this premium domain at a liquidation price. <br className="hidden md:block" />
                        <span className="text-gray-900 dark:text-gray-200 font-medium">Secure this digital asset today.</span>
                    </p>

                    <div className="flex flex-col items-center gap-8">
                        <div className="text-4xl md:text-5xl font-bold text-amber-500">
                            ${domain.price.toLocaleString()}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                            {domain.checkoutLink && (
                                <a
                                    href={domain.checkoutLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-green-600/20 hover:shadow-green-600/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                                >
                                    <Zap className="w-5 h-5" />
                                    Buy Now
                                    <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                                </a>
                            )}
                            {domain.price >= 500 && domain.isVerified && domain.user.escrowEmail && !domain.checkoutLink && (
                                <button
                                    onClick={() => setShowEscrowModal(true)}
                                    className="w-full sm:w-auto px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-green-600/20 hover:shadow-green-600/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                                >
                                    <ShieldCheck className="w-5 h-5" />
                                    Buy Securely
                                    <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                            <button
                                onClick={handleContact}
                                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-900 dark:text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                            >
                                Contact Seller
                            </button>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                            {domain.isVerified && (
                                <>
                                    <div className="flex items-center gap-1.5">
                                        <ShieldCheck className="w-4 h-4 text-green-500" />
                                        Verified Domain
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Lock className="w-4 h-4 text-amber-500" />
                                        Secure Transfer
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Props */}
            <section className="py-20 bg-white dark:bg-white/5 border-y border-gray-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                                <Globe className="w-6 h-6 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 dark:text-white">Global Appeal</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                A universal name that resonates across borders and markets. Perfect for scaling your business globally.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                                <Zap className="w-6 h-6 text-amber-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 dark:text-white">Instant Authority</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Establish immediate credibility with a premium domain name that customers trust and remember.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                                <Star className="w-6 h-6 text-purple-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 dark:text-white">Brandable</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Short, memorable, and unique. The perfect foundation for building a lasting brand identity.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content / Description */}
            {(content || isOwner) && (
                <section className="py-20">
                    <div className="max-w-3xl mx-auto px-4">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold dark:text-white">About this Domain</h2>
                            {isOwner && (
                                <div className="flex gap-2">
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium transition-colors dark:text-white text-gray-900"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleGenerateAI}
                                                disabled={isGenerating}
                                                className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                            >
                                                <Wand2 className="w-4 h-4" />
                                                {isGenerating ? 'Generating...' : 'AI Generate'}
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium transition-colors dark:text-white text-gray-900"
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
                                                {isSaving ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {isEditing ? (
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full h-[400px] bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-6 text-gray-900 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
                                placeholder="Enter your domain description here... Markdown is supported."
                            />
                        ) : (
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                {content ? (
                                    <ReactMarkdown>{content}</ReactMarkdown>
                                ) : (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-600 border border-dashed border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-transparent">
                                        <p>No description available for this domain.</p>
                                        {isOwner && (
                                            <p className="text-sm mt-2">Click "Edit" to add a description or generate one with AI.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* FAQ Section */}
            <section className="py-20 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/5">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {domain.price >= 500 && domain.isVerified && domain.user.escrowEmail ? (
                            <FAQItem
                                question="How does the transfer process work?"
                                answer="We use Escrow.com to ensure a secure transaction. Once payment is verified, the domain will be transferred to your registrar account. The funds are only released to the seller after you confirm you have received the domain."
                            />
                        ) : (
                            <FAQItem
                                question="How does the transfer process work?"
                                answer="This transaction is handled directly between you and the seller. We strongly advise you to exercise caution and only proceed if you trust the seller. For added security, we recommend agreeing on a third-party escrow service."
                            />
                        )}
                        <FAQItem
                            question="Is this a one-time payment?"
                            answer="Yes, the price listed is a one-time payment for full ownership of the domain name. There are no recurring fees from us, though you will need to pay your registrar's annual renewal fee."
                        />
                        <FAQItem
                            question="How long does the transfer take?"
                            answer="Most transfers are completed within 24-48 hours after payment is secured. The exact time depends on your registrar and how quickly you can accept the transfer."
                        />
                        <FAQItem
                            question="Can I negotiate the price?"
                            answer="This domain is priced for liquidation, representing significant value. However, you can use the 'Contact Seller' button to discuss the price directly with the owner."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-200 dark:border-white/10 text-center">
                <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="font-semibold">Secured by Escrow.com</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    © {new Date().getFullYear()} DomainLiq. All rights reserved.
                </p>
            </footer>

            {/* Escrow Modal */}
            {showEscrowModal && (
                <EscrowModal
                    domain={domain}
                    onClose={() => setShowEscrowModal(false)}
                />
            )}

            {/* Contact Method Selection Modal */}
            {showContactModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={() => setShowContactModal(false)}>
                    <div className="dark:bg-[#0A0A0A] bg-white border dark:border-white/10 border-gray-300 rounded-xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4 dark:text-white text-gray-900">Choose Contact Method</h3>
                        <p className="dark:text-gray-400 text-gray-600 text-sm mb-6">How would you like to contact the seller?</p>

                        <div className="space-y-3">
                            {availableMethods.map((method) => (
                                <button
                                    key={method.type}
                                    onClick={() => {
                                        contactViaMethod(method.type);
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
            )}

            {/* Chat Widget */}
            {!isOwner && (
                <ChatWidget
                    domainId={domain.id}
                    sellerName={domain.user.name || domain.user.subdomain}
                />
            )}
        </div>
    );
}

// Sub-components

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left font-medium dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
                {question}
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {isOpen && (
                <div className="p-4 pt-0 text-gray-600 dark:text-gray-400 text-sm leading-relaxed border-t border-gray-100 dark:border-white/5 mt-2">
                    {answer}
                </div>
            )}
        </div>
    );
}

function EscrowModal({ domain, onClose }: { domain: any; onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center border border-green-500/20">
                        <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Buy with Escrow.com</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Secure transaction for {domain.name}</p>
                    </div>
                    <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-white/5">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            This domain is listed for <span className="text-gray-900 dark:text-white font-bold">${domain.price.toLocaleString()}</span>.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
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
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-500 mb-1">Your Email Address</label>
                            <input
                                type="email"
                                name="buyerEmail"
                                required
                                placeholder="you@example.com"
                                className="w-full bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
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
                                onClick={onClose}
                                className="w-full py-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
