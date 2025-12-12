import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function TermsPage() {
    return (
        <div className="min-h-screen dark:bg-[#050505] bg-gray-50 dark:text-white text-gray-900 p-8">
            <div className="max-w-4xl mx-auto prose dark:prose-invert">
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <Logo className="h-8 w-auto cursor-pointer" />
                    </Link>
                </div>
                <h1 className="text-4xl font-bold mb-4 dark:text-white text-gray-900">Terms of Service</h1>
                <p className="dark:text-gray-400 text-gray-600 mb-8">Last Updated: December 12, 2025</p>

                <h2 className="text-2xl font-bold mt-8 mb-4">1. Welcome to DomainLiq</h2>
                <p className="dark:text-gray-300 text-gray-700 mb-4">
                    These Terms of Service ("Terms") govern your use of DomainLiq ("Service", "Platform", "we", "us", or "our"),
                    a domain marketplace platform. By accessing or using our Service, you agree to be bound by these Terms.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">2. Service Description</h2>
                <p className="dark:text-gray-300 text-gray-700 mb-4">
                    DomainLiq is a marketplace platform that:
                </p>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>Allows sellers to list domains for sale</li>
                    <li>Provides buyers with a browsing and search interface</li>
                    <li>Processes payments through Stripe</li>
                    <li>Holds funds securely until domain transfer is confirmed</li>
                    <li>Facilitates domain verification and ownership display</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">3. Platform Fees</h2>
                <div className="dark:bg-white/5 bg-gray-100 rounded-lg p-6 my-6">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b dark:border-white/10 border-gray-300">
                                <th className="pb-2 dark:text-gray-300 text-gray-700">Domain Price</th>
                                <th className="pb-2 dark:text-gray-300 text-gray-700">DomainLiq Fee</th>
                            </tr>
                        </thead>
                        <tbody className="dark:text-gray-300 text-gray-700">
                            <tr><td className="py-2">$1 - $9.99</td><td className="py-2">FREE</td></tr>
                            <tr><td className="py-2">$10 - $50</td><td className="py-2">$1.00</td></tr>
                            <tr><td className="py-2">$51 - $100</td><td className="py-2">$1.50</td></tr>
                            <tr><td className="py-2">$100+</td><td className="py-2">2%</td></tr>
                        </tbody>
                    </table>
                    <p className="text-sm dark:text-gray-500 text-gray-500 mt-4">
                        Stripe payment processing fees (~2.9% + $0.30) are separate and charged by Stripe.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">4. Payment Processing</h2>
                <p className="dark:text-gray-300 text-gray-700 mb-4">
                    All payments are processed through Stripe. By using our Service:
                </p>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>Buyer payments are held securely until transfer is confirmed</li>
                    <li>Sellers must connect a Stripe account to receive payments</li>
                    <li>Payouts are processed to seller's Stripe account after buyer confirmation</li>
                    <li>If buyer doesn't confirm within 7 days, funds auto-release to seller</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">5. Seller Obligations</h2>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>You must own or be authorized to sell listed domains</li>
                    <li>You must provide the Authorization Code within <strong>48 hours</strong> of receiving payment</li>
                    <li>You must ensure the domain is unlocked and ready for transfer</li>
                    <li>You are responsible for accurate listing information</li>
                    <li>Failure to provide a valid Authorization Code within 48 hours results in full refund to buyer</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">6. Buyer Obligations</h2>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>Confirm receipt of domain promptly after transfer completes</li>
                    <li>If you don't confirm within <strong>7 days</strong>, funds are auto-released to seller</li>
                    <li>Report issues with the Authorization Code immediately via support</li>
                    <li>Do not complete transactions outside of the DomainLiq/Stripe system</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">7. Refund Policy</h2>
                <div className="dark:bg-amber-500/10 bg-amber-50 border dark:border-amber-500/30 border-amber-300 rounded-lg p-6 my-6">
                    <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700">
                        <li><strong>Seller doesn't provide Auth Code in 48 hours:</strong> Full refund to buyer</li>
                        <li><strong>Authorization Code is invalid, fake, or expired:</strong> Full refund after investigation</li>
                        <li><strong>Buyer doesn't confirm in 7 days:</strong> No refund (funds release to seller)</li>
                        <li><strong>Successful transfer completed:</strong> No refund</li>
                    </ul>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">8. Dispute Resolution</h2>
                <p className="dark:text-gray-300 text-gray-700 mb-4">
                    Disputes are handled on a case-by-case basis:
                </p>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>Contact support at <a href="mailto:support@domainliq.com" className="text-amber-500">support@domainliq.com</a></li>
                    <li>Or use the Messages feature on your dashboard to contact admin</li>
                    <li>Provide transaction details and evidence of the issue</li>
                    <li>We will investigate and resolve within 5 business days</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">9. Prohibited Activities</h2>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>Listing domains you don't own or have authority to sell</li>
                    <li>Providing false ownership information</li>
                    <li>Fraudulent activities or scams</li>
                    <li>Harassment of other users</li>
                    <li>Requesting payment outside of DomainLiq/Stripe</li>
                    <li>Using invalid or fake Authorization Codes</li>
                    <li>Spam or unsolicited messages</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">10. Domain Verification</h2>
                <p className="dark:text-gray-300 text-gray-700 mb-4">
                    Domain verification (TXT, A, or NS record) demonstrates DNS control only.
                    It does not guarantee legal ownership or freedom from trademark issues.
                    Buyers should conduct their own due diligence.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">11. Limitation of Liability</h2>
                <p className="dark:text-gray-300 text-gray-700 mb-4">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW:
                </p>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>DomainLiq is provided "AS IS" without warranties</li>
                    <li>We are not liable for third-party actions or domain value disputes</li>
                    <li>We are not liable for domain transfer failures outside our control</li>
                    <li>Our liability is limited to the platform fees collected</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">12. Account Termination</h2>
                <p className="dark:text-gray-300 text-gray-700 mb-4">
                    We reserve the right to suspend or terminate accounts that violate these Terms.
                    Users may delete their accounts at any time through Settings.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">13. Changes to Terms</h2>
                <p className="dark:text-gray-300 text-gray-700 mb-4">
                    We may update these Terms from time to time. Continued use of the Service after changes
                    constitutes acceptance of the modified Terms.
                </p>

                <div className="mt-12 pt-8 border-t dark:border-white/10 border-gray-200">
                    <p className="dark:text-gray-400 text-gray-600 text-sm">
                        For questions about these Terms, contact us at <a href="mailto:support@domainliq.com" className="text-amber-500">support@domainliq.com</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
