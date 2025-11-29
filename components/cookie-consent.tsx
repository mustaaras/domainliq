'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('domainliq_consent');
        if (!consent) {
            setShow(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('domainliq_consent', 'accepted');
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-white/10 p-4 z-50 shadow-2xl">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                        <p className="text-white text-sm">
                            <span className="font-semibold">Welcome to DomainLiq!</span> We use minimal cookies for authentication and preferences.
                            By using our platform, you agree to our{' '}
                            <Link href="/terms" className="text-amber-400 hover:text-amber-300 underline">
                                Terms of Service
                            </Link>
                            {' '}and{' '}
                            <Link href="/privacy" className="text-amber-400 hover:text-amber-300 underline">
                                Privacy Policy
                            </Link>.
                        </p>
                        <p className="text-gray-400 text-xs mt-2">
                            ⚠️ Important: We don't process payments. Only purchase from trusted sellers using escrow services.
                        </p>
                    </div>
                    <button
                        onClick={handleAccept}
                        className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                    >
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    );
}
