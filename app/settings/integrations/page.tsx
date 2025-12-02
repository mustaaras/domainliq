'use client';

import { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, ExternalLink, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function IntegrationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showEscrowModal, setShowEscrowModal] = useState(false);

    const [escrowEmail, setEscrowEmail] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated') {
            fetchSettings();
        }
    }, [status, router]);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/user/settings');
            if (!res.ok) throw new Error('Failed to fetch settings');
            const data = await res.json();

            if (data.escrowEmail) {
                setEscrowEmail(data.escrowEmail);
                setTermsAccepted(data.escrowTermsAccepted);
                setIsConnected(true);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveEscrow = async () => {
        if (!termsAccepted) {
            setMessage({ type: 'error', text: 'You must accept the terms to continue.' });
            return;
        }
        if (!escrowEmail) {
            setMessage({ type: 'error', text: 'Please enter your Escrow.com email.' });
            return;
        }

        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/user/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    escrowEmail,
                    escrowTermsAccepted: termsAccepted
                })
            });

            if (!res.ok) throw new Error('Failed to update settings');

            setIsConnected(true);
            setShowEscrowModal(false);
            setMessage({ type: 'success', text: 'Escrow integration connected successfully.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to connect Escrow integration.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect Escrow.com? Buyers will no longer see the "Buy with Escrow" option.')) return;

        setIsSaving(true);
        try {
            const res = await fetch('/api/user/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    escrowEmail: null,
                    escrowTermsAccepted: false
                })
            });

            if (!res.ok) throw new Error('Failed to disconnect');

            setEscrowEmail('');
            setTermsAccepted(false);
            setIsConnected(false);
            setMessage({ type: 'success', text: 'Escrow integration disconnected.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to disconnect.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
                            <ShieldCheck className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Escrow.com Integration</h2>
                            <p className="text-sm text-gray-400 mt-1">Secure transactions for high-value domains</p>
                        </div>
                    </div>
                    {isConnected && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full border border-green-500/20 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Connected
                        </span>
                    )}
                </div>

                <div className="space-y-4">
                    <p className="text-gray-300 text-sm leading-relaxed">
                        Connect your Escrow.com account to enable secure transactions for domains listed over $500.
                        When connected, buyers will see a "Buy with Escrow" option on your verified listings.
                    </p>

                    {isConnected ? (
                        <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Connected Account</p>
                                    <p className="text-white font-mono">{escrowEmail}</p>
                                </div>
                                <button
                                    onClick={handleDisconnect}
                                    disabled={isSaving}
                                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Disconnect
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowEscrowModal(true)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            Connect Escrow.com
                            <ExternalLink className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                    {message.text}
                </div>
            )}

            {/* Escrow Modal */}
            {showEscrowModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEscrowModal(false)}>
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-4">Connect Escrow.com</h3>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">General Escrow Instructions</label>
                            <div className="h-48 overflow-y-auto bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-gray-400 mb-4">
                                <p className="mb-4">
                                    By connecting your Escrow.com account, you agree to facilitate transactions through Escrow.com for eligible domains.
                                </p>
                                <p className="mb-4">
                                    1. You must have an active and verified Escrow.com account.<br />
                                    2. You agree to initiate or accept transactions promptly upon buyer request.<br />
                                    3. You are responsible for all Escrow.com fees unless otherwise agreed with the buyer.<br />
                                    4. DomainLiq is not a party to the escrow transaction and assumes no liability for the outcome.
                                </p>
                                <p>
                                    Please ensure your contact email matches your Escrow.com account email for smoother verification.
                                </p>
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer group mb-6">
                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${termsAccepted ? 'bg-green-500 border-green-500' : 'border-white/20 group-hover:border-white/40'}`}>
                                    {termsAccepted && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={termsAccepted}
                                    onChange={e => setTermsAccepted(e.target.checked)}
                                />
                                <span className="text-sm text-gray-300 select-none">
                                    I accept the General Escrow Instructions and agree to the terms of service.
                                </span>
                            </label>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-white">Escrow.com Email Address</label>
                                <input
                                    type="email"
                                    value={escrowEmail}
                                    onChange={e => setEscrowEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 placeholder-gray-600"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowEscrowModal(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEscrow}
                                disabled={isSaving || !termsAccepted || !escrowEmail}
                                className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                                Connect Account
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
