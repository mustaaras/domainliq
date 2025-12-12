import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function SellerGuidePage() {
    return (
        <div className="min-h-screen dark:bg-[#050505] bg-gray-50 dark:text-white text-gray-900 p-8">
            <div className="max-w-4xl mx-auto prose dark:prose-invert">
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <Logo className="h-8 w-auto cursor-pointer" />
                    </Link>
                </div>
                <h1 className="text-4xl font-bold mb-4 dark:text-white text-gray-900">Seller's Guide</h1>
                <p className="dark:text-gray-400 text-gray-600 mb-8">How to successfully sell domains on DomainLiq</p>

                <div className="dark:bg-green-500/10 bg-green-50 border dark:border-green-500/30 border-green-300 rounded-lg p-6 my-6">
                    <p className="font-bold dark:text-green-400 text-green-700 mb-2">💰 Get Paid Directly!</p>
                    <p className="dark:text-gray-300 text-gray-700">
                        DomainLiq handles payments through Stripe. Connect your account, and buyers can purchase your domains instantly with credit card. Funds are held securely until the buyer confirms receipt.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">Platform Fees</h2>
                <div className="dark:bg-white/5 bg-gray-100 rounded-lg p-6 my-6">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b dark:border-white/10 border-gray-300">
                                <th className="pb-2 dark:text-gray-300 text-gray-700">Domain Price</th>
                                <th className="pb-2 dark:text-gray-300 text-gray-700">Platform Fee</th>
                            </tr>
                        </thead>
                        <tbody className="dark:text-gray-300 text-gray-700">
                            <tr><td className="py-2">$1 - $9.99</td><td className="py-2 text-green-500 font-bold">FREE</td></tr>
                            <tr><td className="py-2">$10 - $50</td><td className="py-2">$1.00 flat</td></tr>
                            <tr><td className="py-2">$51 - $100</td><td className="py-2">$1.50 flat</td></tr>
                            <tr><td className="py-2">$100+</td><td className="py-2">2%</td></tr>
                        </tbody>
                    </table>
                    <p className="text-sm dark:text-gray-500 text-gray-500 mt-4">
                        Note: Stripe also charges ~2.9% + $0.30 per transaction for payment processing.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 1: Create Your Account</h2>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>Click "Sign Up" in the top navigation</li>
                    <li>Provide your name, email, and password</li>
                    <li>Choose a username (this becomes your store URL)</li>
                    <li>You'll receive a welcome email with getting started tips</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 2: Connect Stripe (Required to Accept Payments)</h2>
                <div className="dark:bg-amber-500/10 bg-amber-50 border dark:border-amber-500/30 border-amber-300 rounded-lg p-6 my-6">
                    <p className="font-bold dark:text-amber-400 text-amber-700 mb-2">⚡ Enable "Buy Now" Button</p>
                    <ol className="list-decimal pl-6 dark:text-gray-300 text-gray-700">
                        <li>Go to <strong>Settings → Payment Integration</strong></li>
                        <li>Click <strong>"Connect with Stripe"</strong></li>
                        <li>Complete Stripe's onboarding (takes ~5 minutes)</li>
                        <li>Once connected, a "Buy Now" button appears on all your domains!</li>
                    </ol>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 3: Add Domains</h2>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>Go to your Dashboard</li>
                    <li>Enter the domain name and price</li>
                    <li>Click "Add Domain"</li>
                    <li><strong>Homepage:</strong> Only domains priced under $1,000 appear on the homepage</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 4: Verify Ownership (Recommended)</h2>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>Click "Verify" next to your domain</li>
                    <li>Choose TXT, A record, or NS record verification</li>
                    <li>Verified domains get a <span className="text-green-500">green shield badge</span> = more buyer trust!</li>
                    <li><strong>Bonus:</strong> A record verification gives you a free "For Sale" landing page</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 5: When You Make a Sale</h2>
                <div className="dark:bg-blue-500/10 bg-blue-50 border dark:border-blue-500/30 border-blue-300 rounded-lg p-6 my-6">
                    <p className="font-bold dark:text-blue-400 text-blue-700 mb-2">📧 You'll Be Notified!</p>
                    <p className="dark:text-gray-300 text-gray-700 mb-4">
                        When a buyer purchases your domain, you'll receive an email notification instantly.
                    </p>
                    <ol className="list-decimal pl-6 dark:text-gray-300 text-gray-700 space-y-2">
                        <li>Go to <strong>Dashboard → Orders</strong></li>
                        <li>Find the order and click <strong>"Transfer Now"</strong></li>
                        <li>Enter the domain's <strong>Authorization Code (EPP Code)</strong></li>
                        <li>The buyer will receive a secure link to claim their domain</li>
                    </ol>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 6: Getting Paid</h2>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>Funds are held securely until the buyer confirms receipt</li>
                    <li>Once confirmed, payout is sent to your connected Stripe account</li>
                    <li>If the buyer doesn't confirm within <strong>7 days</strong>, funds auto-release to you</li>
                    <li>Payouts typically arrive in 2-3 business days</li>
                </ul>

                <div className="dark:bg-red-500/10 bg-red-50 border dark:border-red-500/30 border-red-300 rounded-lg p-6 my-6">
                    <p className="font-bold dark:text-red-400 text-red-700 mb-2">⚠️ Important: 48-Hour Rule</p>
                    <p className="dark:text-gray-300 text-gray-700">
                        You must provide the Authorization Code within <strong>48 hours</strong> of receiving payment.
                        If you don't, the buyer is entitled to a full refund.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">Alternative: Escrow.com</h2>
                <p className="dark:text-gray-300 text-gray-700 mb-4">
                    For buyers who prefer traditional escrow, you can also accept offers through Escrow.com integration.
                    This is useful for high-value domains or international transactions.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">Best Practices</h2>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>Keep your domains unlocked and ready for transfer</li>
                    <li>Have Authorization Codes ready before listing</li>
                    <li>Respond to orders within 48 hours</li>
                    <li>Mark domains as sold after completing transfers</li>
                    <li>Check your Messages for buyer inquiries</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Need Help?</h2>
                <p className="dark:text-gray-300 text-gray-700 mb-4">
                    Contact us at <a href="mailto:support@domainliq.com" className="text-amber-500">support@domainliq.com</a> or
                    through the Messages feature in your dashboard.
                </p>

                <div className="mt-12 pt-8 border-t dark:border-white/10 border-gray-200 text-center">
                    <p className="dark:text-gray-400 text-gray-600">
                        Ready to start selling? Connect your Stripe account today!
                    </p>
                    <p className="dark:text-gray-500 text-gray-500 mt-4">
                        Happy selling! 🚀
                    </p>
                </div>
            </div>
        </div>
    );
}
