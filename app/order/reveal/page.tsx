'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Logo } from '@/components/logo';
import { Loader2, Eye, CheckCircle, ShieldCheck, AlertCircle, Copy, Check } from 'lucide-react';
import Link from 'next/link';

interface OrderData {
    id: string;
    domainName: string;
    authCode: string | null;
    status: string;
    amount: number;
}

export default function RevealAuthCodePage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [order, setOrder] = useState<OrderData | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Invalid link. Missing token.');
            setIsLoading(false);
            return;
        }

        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/orders/reveal?token=${token}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Failed to load order');
                }

                setOrder(data);

                if (data.status === 'completed') {
                    setIsConfirmed(true);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [token]);

    const handleCopyAuthCode = async () => {
        if (order?.authCode) {
            await navigator.clipboard.writeText(order.authCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleConfirmReceipt = async () => {
        if (!token) return;

        setIsConfirming(true);
        setError(null);
        try {
            const res = await fetch(`/api/orders/confirm?token=${token}`, {
                method: 'POST',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to confirm receipt');
            }

            setIsConfirmed(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsConfirming(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex flex-col items-center justify-center p-4">
                <Logo className="h-8 w-auto mb-8" />
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-6 max-w-md w-full text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h1>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                    <Link href="/" className="mt-6 inline-block text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-400">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (isConfirmed) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex flex-col items-center justify-center p-4">
                <Logo className="h-8 w-auto mb-8" />
                <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl p-8 max-w-md w-full text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Transfer Confirmed!</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Thank you for confirming. The payment has been released to the seller.
                    </p>
                    <div className="bg-gray-100 dark:bg-white/5 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-500 mb-1">Domain Acquired</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{order?.domainName}</p>
                    </div>
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
                    >
                        Explore More Domains
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex flex-col items-center justify-center p-4">
            <Logo className="h-8 w-auto mb-8" />

            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-8 max-w-lg w-full shadow-lg">
                <div className="text-center mb-8">
                    <ShieldCheck className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Domain Transfer</h1>
                    <p className="text-gray-600 dark:text-gray-400">The seller has initiated the transfer for your domain.</p>
                </div>

                {/* Order Info */}
                <div className="bg-gray-100 dark:bg-white/5 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-500">Domain</span>
                        <span className="font-bold text-gray-900 dark:text-white">{order?.domainName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">Amount</span>
                        <span className="font-bold text-green-600 dark:text-green-400">${((order?.amount || 0) / 100).toFixed(2)}</span>
                    </div>
                </div>

                {/* Auth Code Section */}
                {order?.authCode ? (
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">1</span>
                            Authorization Code
                        </h2>

                        {!isRevealed ? (
                            <button
                                onClick={() => setIsRevealed(true)}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <Eye className="h-5 w-5" />
                                Click to Reveal Auth Code
                            </button>
                        ) : (
                            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <code className="text-xl font-mono font-bold text-amber-600 dark:text-amber-400 break-all">
                                        {order.authCode}
                                    </code>
                                    <button
                                        onClick={handleCopyAuthCode}
                                        className="shrink-0 p-2 bg-amber-100 dark:bg-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/30 rounded-lg transition-colors"
                                        title="Copy to clipboard"
                                    >
                                        {copied ? (
                                            <Check className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <Copy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-sm text-amber-700 dark:text-amber-200/70 mt-3">
                                    Use this code to transfer the domain at your registrar (Namecheap, GoDaddy, Cloudflare, etc.)
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="mb-8 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 rounded-xl p-4">
                        <h2 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400 mb-2">⏳ Waiting for Auth Code</h2>
                        <p className="text-yellow-700 dark:text-gray-400 text-sm">
                            The seller is preparing the authorization code. You'll receive an email when it's ready.
                        </p>
                    </div>
                )}

                {/* Confirm Section */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">2</span>
                        Confirm Receipt
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        Once you have successfully transferred the domain to your registrar account, click the button below to release the payment to the seller.
                    </p>
                    <button
                        onClick={handleConfirmReceipt}
                        disabled={isConfirming}
                        className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        {isConfirming ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-5 w-5" />
                                I Have Received the Domain
                            </>
                        )}
                    </button>
                </div>

                {/* Footer Note */}
                <p className="text-center text-gray-500 text-xs mt-6">
                    If you don't confirm within 7 days, the funds will be released automatically.
                </p>
            </div>
        </div>
    );
}
