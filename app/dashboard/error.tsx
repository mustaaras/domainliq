'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Dashboard Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0A0A0A] p-4">
            <div className="max-w-md w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-8 text-center shadow-xl">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 mb-6">
                    <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Something went wrong!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    We encountered an unexpected error while loading your dashboard.
                    {error.message && <span className="block mt-2 text-xs font-mono bg-gray-100 dark:bg-black/30 p-2 rounded text-red-500">{error.message}</span>}
                </p>
                <button
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    Try again
                </button>
            </div>
        </div>
    );
}
