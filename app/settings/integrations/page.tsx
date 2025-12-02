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
            <div className="dark:bg-white/5 bg-white border dark:border-white/10 border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 dark:bg-green-500/10 bg-green-50 rounded-xl flex items-center justify-center border dark:border-green-500/20 border-green-200">
                            <ShieldCheck className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold dark:text-white text-gray-900">Escrow.com Integration</h2>
                            <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">Secure transactions for high-value domains</p>
                        </div>
                    </div>
                    {isConnected && (
                        <span className="px-3 py-1 dark:bg-green-500/20 bg-green-50 dark:text-green-400 text-green-700 text-xs font-medium rounded-full border dark:border-green-500/20 border-green-300 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Connected
                        </span>
                    )}
                </div>

                <div className="space-y-4">
                    <p className="dark:text-gray-300 text-gray-700 text-sm leading-relaxed">
                        Connect your Escrow.com account to enable secure transactions for domains listed over $500.
                        When connected, buyers will see a "Buy with Escrow" option on your verified listings.
                    </p>

                    {isConnected ? (
                        <div className="dark:bg-black/20 bg-gray-100 rounded-lg p-4 border dark:border-white/5 border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs dark:text-gray-500 text-gray-600 mb-1">Connected Account</p>
                                    <p className="dark:text-white text-gray-900 font-mono">{escrowEmail}</p>
                                </div>
                                <button
                                    onClick={handleDisconnect}
                                    disabled={isSaving}
                                    className="text-sm dark:text-red-400 text-red-600 dark:hover:text-red-300 hover:text-red-700 transition-colors"
                                >
                                    Disconnect
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowEscrowModal(true)}
                            className="px-4 py-2 bg-green-600 dark:hover:bg-green-500 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            Connect Escrow.com
                            <ExternalLink className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg text-sm ${message.type === 'error' ? 'dark:bg-red-500/10 bg-red-50 dark:text-red-400 text-red-700' : 'dark:bg-green-500/10 bg-green-50 dark:text-green-400 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Escrow Modal */}
            {showEscrowModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEscrowModal(false)}>
                    <div className="dark:bg-[#0A0A0A] bg-white border dark:border-white/10 border-gray-300 rounded-xl max-w-lg w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold dark:text-white text-gray-900 mb-4">Connect Escrow.com</h3>

                        <div className="mb-6">
                            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">General Escrow Instructions</label>
                            <div className="h-48 overflow-y-auto dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg p-4 text-sm dark:text-gray-400 text-gray-700 mb-4">
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
                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${termsAccepted ? 'bg-green-500 border-green-500' : 'dark:border-white/20 border-gray-300 dark:group-hover:border-white/40 group-hover:border-gray-400'}`}>
                                    {termsAccepted && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={termsAccepted}
                                    onChange={e => setTermsAccepted(e.target.checked)}
                                />
                                <span className="text-sm dark:text-gray-300 text-gray-700 select-none">
                                    I accept the General Escrow Instructions and agree to the terms of service.
                                </span>
                            </label>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium dark:text-white text-gray-900">Escrow.com Email Address</label>
                                <input
                                    type="email"
                                    value={escrowEmail}
                                    onChange={e => setEscrowEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    className="w-full dark:bg-black/20 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg px-4 py-2.5 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:placeholder-gray-600 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowEscrowModal(false)}
                                className="px-4 py-2 dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEscrow}
                                disabled={isSaving || !termsAccepted || !escrowEmail}
                                className="px-6 py-2 bg-green-600 dark:hover:bg-green-500 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
