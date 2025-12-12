import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function BuyerGuidePage() {
    return (
        <div className="min-h-screen dark:bg-[#050505] bg-gray-50 dark:text-white text-gray-900 p-8">
            <div className="max-w-4xl mx-auto prose dark:prose-invert">
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <Logo className="h-8 w-auto cursor-pointer" />
                    </Link>
                </div>
                <h1 className="text-4xl font-bold mb-4 dark:text-white text-gray-900">Buyer's Guide</h1>
                <p className="dark:text-gray-400 text-gray-600 mb-8">How to safely buy domains on DomainLiq</p>

                <div className="dark:bg-green-500/10 bg-green-50 border dark:border-green-500/30 border-green-300 rounded-lg p-6 my-6">
                    <p className="font-bold dark:text-green-400 text-green-700 mb-2">🔒 Secure Payments</p>
                    <p className="dark:text-gray-300 text-gray-700">
                        Your payment is held securely until you receive and confirm the domain transfer.
                        The seller only gets paid after you confirm receipt.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 1: Browse Domains</h2>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>Visit the homepage to see available domains</li>
                    <li>Use the search bar to find specific domains</li>
                    <li>Look for the <span className="text-green-500">green shield badge</span> = verified ownership</li>
                    <li>Check seller profiles to see all their listings</li>
                    <li><strong>Tip:</strong> Type a verified domain directly in your browser to see its landing page!</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 2: Purchase with "Buy Now"</h2>
                <div className="dark:bg-blue-500/10 bg-blue-50 border dark:border-blue-500/30 border-blue-300 rounded-lg p-6 my-6">
                    <p className="font-bold dark:text-blue-400 text-blue-700 mb-2">⚡ Instant Checkout</p>
                    <ol className="list-decimal pl-6 dark:text-gray-300 text-gray-700 space-y-2">
                        <li>Click the <strong>"Buy Now"</strong> button on any domain</li>
                        <li>Enter your email and payment details</li>
                        <li>Complete the secure Stripe checkout</li>
                        <li>You'll receive a confirmation email immediately</li>
                    </ol>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 3: Receive the Domain</h2>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>The seller will be notified instantly of your purchase</li>
                    <li>They have <strong>48 hours</strong> to provide the Authorization Code</li>
                    <li>You'll receive a secure email with a link to claim your domain</li>
                    <li>The email contains the Authorization Code needed for transfer</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 4: Transfer the Domain</h2>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>Log into your domain registrar (GoDaddy, Namecheap, etc.)</li>
                    <li>Start a domain transfer using the Authorization Code</li>
                    <li>The transfer typically takes 5-7 days to complete</li>
                    <li>Some registrars offer instant transfers if both accounts are on the same platform</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 5: Confirm Receipt</h2>
                <div className="dark:bg-amber-500/10 bg-amber-50 border dark:border-amber-500/30 border-amber-300 rounded-lg p-6 my-6">
                    <p className="font-bold dark:text-amber-400 text-amber-700 mb-2">⚠️ Important: Confirm Within 7 Days</p>
                    <p className="dark:text-gray-300 text-gray-700 mb-4">
                        Once you've received the domain, click the "Confirm Receipt" button in your email.
                        This releases the payment to the seller.
                    </p>
                    <p className="dark:text-gray-300 text-gray-700">
                        <strong>Note:</strong> If you don't confirm within 7 days, funds are automatically released to the seller.
                        Only leave unconfirmed if there's an issue with the transfer.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">Refund Policy</h2>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li><strong>Seller doesn't respond in 48 hours:</strong> Full refund</li>
                    <li><strong>Authorization Code doesn't work:</strong> Contact support, we'll investigate and issue a refund if the code is invalid</li>
                    <li><strong>You don't act within 7 days:</strong> Funds are released to seller (no refund)</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Alternative: Escrow.com</h2>
                <p className="dark:text-gray-300 text-gray-700 mb-4">
                    For high-value domains or if you prefer traditional escrow, look for the "Escrow" button.
                    This redirects you to Escrow.com for a secure third-party transaction.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">Red Flags to Watch For</h2>
                <div className="dark:bg-red-500/10 bg-red-50 border dark:border-red-500/30 border-red-300 rounded-lg p-6 my-6">
                    <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700">
                        <li>Seller asks for payment outside DomainLiq/Stripe</li>
                        <li>Demands payment via cryptocurrency or gift cards</li>
                        <li>Can't provide proof of ownership</li>
                        <li>Price is too good to be true</li>
                        <li>Pressures you to act quickly</li>
                        <li>Domain is not verified (no green shield)</li>
                    </ul>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">Tips for Success</h2>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>Check the domain's WHOIS history</li>
                    <li>Verify there are no trademark issues</li>
                    <li>Prefer verified domains with the green shield</li>
                    <li>Contact the seller with questions before buying</li>
                    <li>Keep all communication documented</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Need Help?</h2>
                <p className="dark:text-gray-300 text-gray-700 mb-4">
                    Contact us at <a href="mailto:support@domainliq.com" className="text-amber-500">support@domainliq.com</a> for
                    any questions or issues with your purchase.
                </p>

                <div className="mt-12 pt-8 border-t dark:border-white/10 border-gray-200 text-center">
                    <p className="dark:text-gray-400 text-gray-600">
                        Ready to find your perfect domain?
                    </p>
                    <p className="dark:text-gray-500 text-gray-500 mt-4">
                        Happy domain hunting! 🎯
                    </p>
                </div>
            </div>
        </div>
    );
}
