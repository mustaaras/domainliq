'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Check, Loader2, Clock } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-[#111] border dark:border-white/10 rounded-2xl p-8 text-center">
                <div className="h-16 w-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Payment Successful!
                </h1>

                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Your order has been confirmed. The seller has been notified and will transfer the domain to you shortly.
                </p>

                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3 text-left">
                        <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                What happens next?
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                The seller will transfer the domain to your email address. You'll receive an email to confirm receipt.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                    <p>✉️ Check your email for order confirmation</p>
                    <p>🔒 Your funds are held securely until you confirm</p>
                    <p>⏰ 7-day automatic release if not confirmed</p>
                </div>

                <Link
                    href="/"
                    className="inline-block mt-8 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    Return to DomainLiq
                </Link>
            </div>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
