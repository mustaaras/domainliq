'use client';

import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './theme-provider';
import { Logo } from './logo';

export default function Footer() {
    const { theme, toggleTheme } = useTheme();

    return (
        <footer className="border-t border-white/10 dark:bg-[#050505] bg-white dark:text-white text-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <Link href="/">
                            <Logo className="h-8 w-auto mb-4 cursor-pointer" />
                        </Link>
                        <p className="text-xs dark:text-gray-400 text-gray-600">
                            Free and open domain liquidation platform. Connect sellers with buyers directly.
                        </p>

                        {/* Theme Toggle */}
                        <div className="mt-6">
                            <button
                                onClick={toggleTheme}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg dark:bg-white/5 bg-gray-100 dark:hover:bg-white/10 hover:bg-gray-200 transition-colors"
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? (
                                    <>
                                        <Sun className="h-4 w-4" />
                                        <span className="text-xs">Light Mode</span>
                                    </>
                                ) : (
                                    <>
                                        <Moon className="h-4 w-4" />
                                        <span className="text-xs">Dark Mode</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Guides */}
                    <div>
                        <h3 className="font-semibold mb-4 dark:text-white text-gray-900">Resources</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/buyer-guide" className="dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 text-xs transition-colors">
                                    Buyer's Guide
                                </Link>
                            </li>
                            <li>
                                <Link href="/seller-guide" className="dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 text-xs transition-colors">
                                    Seller's Guide
                                </Link>
                            </li>
                            <li>
                                <Link href="/resources/faq" className="dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 text-xs transition-colors">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-semibold mb-4 dark:text-white text-gray-900">Legal</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/terms" className="dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 text-xs transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 text-xs transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 text-xs transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Info & Theme Toggle */}
                    <div>
                        <h3 className="font-semibold mb-4 dark:text-white text-gray-900">Important</h3>
                        <ul className="space-y-2 text-xs dark:text-gray-400 text-gray-600">
                            <li>✓ Non-Transactional Platform</li>
                            <li>✓ Privacy-First & Ad-Free</li>
                            <li>✓ 100% Free Listing Service</li>
                            <li className="text-amber-500">⚠ Secure Escrow Recommended</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t dark:border-white/10 border-gray-200 text-center dark:text-gray-500 text-gray-600 text-xs">
                    <p>© {new Date().getFullYear()} DomainLiq. All rights reserved.</p>
                    <p className="mt-2">A free, open platform for domain liquidation listing.</p>
                </div>
            </div>
        </footer>
    );
}
