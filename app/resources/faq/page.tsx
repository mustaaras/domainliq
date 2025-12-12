import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function FAQPage() {
    return (
        <div className="min-h-screen dark:bg-[#050505] bg-gray-50 dark:text-white text-gray-900 p-8">
            <div className="max-w-4xl mx-auto prose dark:prose-invert">
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <Logo className="h-8 w-auto cursor-pointer" />
                    </Link>
                </div>
                <h1 className="text-4xl font-bold mb-4 dark:text-white text-gray-900">Frequently Asked Questions</h1>
                <p className="dark:text-gray-400 text-gray-600 mb-8">Common questions about buying and selling on DomainLiq</p>

                <div className="space-y-8">
                    {/* General */}
                    <section>
                        <h2 className="text-2xl font-bold dark:text-amber-500 text-amber-600 mb-4">General</h2>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2 dark:text-white text-gray-900">What is DomainLiq?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                DomainLiq is a domain marketplace that connects sellers with buyers. We handle payments through Stripe
                                and hold funds securely until domain transfer is confirmed.
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">What are the platform fees?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                Our fees are simple and transparent:
                            </p>
                            <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mt-2">
                                <li><strong>$1 - $9.99:</strong> FREE (no platform fee)</li>
                                <li><strong>$10 - $50:</strong> $1.00 flat</li>
                                <li><strong>$51 - $100:</strong> $1.50 flat</li>
                                <li><strong>$100+:</strong> 2%</li>
                            </ul>
                            <p className="dark:text-gray-500 text-gray-500 text-sm mt-2">
                                Stripe also charges ~2.9% + $0.30 per transaction.
                            </p>
                        </div>
                    </section>

                    {/* Buying */}
                    <section>
                        <h2 className="text-2xl font-bold dark:text-green-500 text-green-600 mb-4">Buying Domains</h2>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">How do I buy a domain?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                Find a domain you like and click the <strong>"Buy Now"</strong> button. You'll complete a secure Stripe checkout,
                                and the seller will be notified to transfer the domain to you.
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">Is my payment protected?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                Yes! Your payment is held securely until you confirm receipt of the domain.
                                The seller only gets paid after you click "Confirm Receipt".
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">What if the seller doesn't transfer the domain?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                Sellers must provide the Authorization Code within <strong>48 hours</strong>.
                                If they don't, you're entitled to a full refund. Contact support@domainliq.com.
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">What if the Authorization Code doesn't work?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                Contact us immediately at support@domainliq.com. We'll investigate and if the code is invalid, expired,
                                or fake, you'll receive a full refund.
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">How long do I have to confirm receipt?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                You have <strong>7 days</strong> from when the seller provides the Authorization Code.
                                After 7 days, funds are automatically released to the seller.
                            </p>
                        </div>
                    </section>

                    {/* Selling */}
                    <section>
                        <h2 className="text-2xl font-bold dark:text-blue-500 text-blue-600 mb-4">Selling Domains</h2>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">How do I start selling?</h3>
                            <ol className="list-decimal pl-6 dark:text-gray-300 text-gray-700">
                                <li>Create an account</li>
                                <li>Go to Settings → Payment Integration → Connect with Stripe</li>
                                <li>Add your domains from the Dashboard</li>
                                <li>Verify ownership to get the green badge</li>
                            </ol>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">How do I get paid?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                When a buyer purchases your domain, provide the Authorization Code within 48 hours.
                                Once the buyer confirms receipt (or after 7 days), funds are sent to your Stripe account.
                                Payouts typically arrive in 2-3 business days.
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">What happens if the buyer doesn't confirm?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                If you provided a valid Authorization Code and the buyer doesn't confirm within 7 days,
                                the funds are <strong>automatically released</strong> to you.
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">Why isn't my domain on the homepage?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                The homepage features domains priced <strong>under $1,000</strong> to focus on quick liquidation.
                                Higher-priced domains are visible on your profile page.
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">What is domain verification?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                Verification proves you control the domain's DNS. Add a TXT, A, or NS record to get a
                                <span className="text-green-500"> green verified badge</span>.
                                A record verification also enables a free "For Sale" landing page!
                            </p>
                        </div>
                    </section>

                    {/* Support */}
                    <section>
                        <h2 className="text-2xl font-bold dark:text-purple-500 text-purple-600 mb-4">Support & Disputes</h2>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">How do I contact support?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                Email us at <a href="mailto:support@domainliq.com" className="text-amber-500">support@domainliq.com</a> or
                                use the Messages feature on your dashboard to chat with our team.
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">How are disputes handled?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                Disputes are handled case-by-case. Contact support with transaction details and we'll investigate
                                within 5 business days. We aim to be fair to both buyers and sellers.
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">Can I delete my account?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                Yes, you can delete your account and all data at any time from Settings → Danger Zone.
                            </p>
                        </div>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t dark:border-white/10 border-gray-200 text-center">
                    <p className="dark:text-gray-400 text-gray-600">
                        Still have questions? <a href="mailto:support@domainliq.com" className="dark:text-amber-500 text-amber-600">Contact Us</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
