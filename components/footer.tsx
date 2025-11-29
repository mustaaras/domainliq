'use client';

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-[#050505] text-white">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <Link href="/">
                            <img src="/logo.svg" alt="DomainLiq" className="h-8 w-auto mb-4 cursor-pointer" />
                        </Link>
                        <p className="text-sm text-gray-400">
                            Free and open domain liquidation listing platform. Connect sellers with buyers directly.
                        </p>
                    </div>

                    {/* Guides */}
                    <div>
                        <h3 className="font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/buyer-guide" className="text-gray-400 hover:text-white text-sm transition-colors">
                                    Buyer's Guide
                                </Link>
                            </li>
                            <li>
                                <Link href="/seller-guide" className="text-gray-400 hover:text-white text-sm transition-colors">
                                    Seller's Guide
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Info */}
                    <div>
                        <h3 className="font-semibold mb-4">Important</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>✓ No payment processing</li>
                            <li>✓ No data selling</li>
                            <li>✓ Free platform</li>
                            <li className="text-amber-400">⚠ Use escrow for safety</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} DomainLiq. All rights reserved.</p>
                    <p className="mt-2">A free, open platform for domain liquidation listing.</p>
                </div>
            </div>
        </footer>
    );
}
