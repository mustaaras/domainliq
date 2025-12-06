'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { WhoisLookup } from '@/components/home/whois-lookup';
import { useSession } from 'next-auth/react';
import { ArrowRight } from 'lucide-react';

export default function WhoisPage() {
    const { data: session } = useSession();

    return (
        <div className="min-h-screen dark:bg-[#050505] bg-gray-50 dark:text-white text-gray-900 font-sans selection:bg-amber-500/20">
            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* Header */}
                <header className="mb-16">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
                        <div className="text-center md:text-left w-full md:w-auto">
                            <Link href="/" className="inline-block group">
                                <div className="flex items-center gap-3 justify-center md:justify-start">
                                    <Logo className="h-11 w-auto transition-transform group-hover:scale-105 duration-300" />
                                </div>
                            </Link>
                            <div className="flex items-center gap-3 justify-center md:justify-start mt-3">
                                <span className="h-px w-8 bg-gradient-to-r from-amber-500/50 to-transparent hidden md:block"></span>
                                <p className="text-xs font-semibold tracking-[0.2em] text-gray-500 dark:text-gray-400 uppercase">
                                    Domain Tools
                                </p>
                            </div>
                        </div>

                        {/* Auth Buttons */}
                        <div className="flex gap-2">
                            {session ? (
                                <Link
                                    href="/dashboard"
                                    className="group relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative flex items-center gap-2 text-sm">
                                        Dashboard
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 text-sm font-medium dark:text-gray-300 text-gray-700 dark:hover:text-white hover:text-gray-900 transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="max-w-2xl mx-auto mt-12">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-bold dark:text-white text-gray-900 mb-4">
                            WHOIS Lookup
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            Instantly check domain availability and registration details.
                        </p>
                    </div>

                    <WhoisLookup />

                    <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-500">
                        <p>Limited to 5 searches per minute.</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
