'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Check, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

function ConfirmContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid confirmation link.');
            return;
        }

        confirmOrder();
    }, [token]);

    const confirmOrder = async () => {
        try {
            const res = await fetch('/api/orders/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to confirm order');
            }

            setStatus('success');
            setMessage(data.message);

        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Something went wrong');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-[#111] border dark:border-white/10 rounded-2xl p-8 text-center">
                {status === 'loading' && (
                    <>
                        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mx-auto mb-4" />
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Confirming your order...
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Please wait while we process your confirmation.
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="h-16 w-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Order Confirmed!
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {message}
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            The seller has received their payout. Thank you for using DomainLiq!
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="h-16 w-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Confirmation Failed
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {message}
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            If you need help, please contact{' '}
                            <a href="mailto:support@domainliq.com" className="text-indigo-500 hover:underline">
                                support@domainliq.com
                            </a>
                        </p>
                    </>
                )}

                <Link
                    href="/"
                    className="inline-block mt-8 text-sm text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                    Go to DomainLiq
                </Link>
            </div>
        </div>
    );
}

export default function OrderConfirmPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
        }>
            <ConfirmContent />
        </Suspense>
    );
}
