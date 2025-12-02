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
                                DomainLiq is a free, open marketplace for domain liquidation. We connect domain sellers directly with buyers,
                                focusing on quick sales and transparent pricing.
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">Is DomainLiq free to use?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                Yes! Listing domains is 100% free. We do not charge listing fees or commission on sales.
                            </p>
                        </div>
                    </section>

                    {/* Buying & Escrow */}
                    <section>
                        <h2 className="text-2xl font-bold dark:text-green-500 text-green-600 mb-4">Buying & Escrow</h2>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">How do I buy a domain?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                You can browse domains on our homepage or search for specific names. Once you find a domain you like,
                                you can either contact the seller directly or use our "Buy with Escrow" feature for a secure transaction.
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">How does "Buy with Escrow" work?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                We have integrated with <strong>Escrow.com</strong> to provide secure transactions. When you click "Buy with Escrow":
                            </p>
                            <ol className="list-decimal pl-6 dark:text-gray-300 text-gray-700 mt-2">
                                <li>You enter your email address</li>
                                <li>We automatically create a secure transaction on Escrow.com</li>
                                <li>You are redirected to Escrow.com to complete the payment</li>
                                <li>Escrow.com holds the funds until the domain is transferred to you</li>
                            </ol>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">Is my money safe?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                Yes. We strongly recommend using Escrow.com for all transactions. They act as a neutral third party,
                                holding your payment until you confirm you have received the domain. DomainLiq never touches your money.
                            </p>
                        </div>
                    </section>

                    {/* Selling */}
                    <section>
                        <h2 className="text-2xl font-bold dark:text-blue-500 text-blue-600 mb-4">Selling</h2>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">How do I list my domains?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                Simply create an account, go to your dashboard, and click "Add Domain". You can list domains individually
                                or bulk import them.
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">How do I verify ownership?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                To get the "Verified" badge, you need to add a specific TXT record to your domain's DNS settings.
                                Instructions are provided in your dashboard.
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">Why isn't my domain on the homepage?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                The homepage features domains priced <strong>under $1,000</strong> to focus on quick liquidation deals.
                                Higher-priced domains are still visible on your profile and via search.
                            </p>
                        </div>
                    </section>

                    {/* Account & Privacy */}
                    <section>
                        <h2 className="text-2xl font-bold dark:text-purple-500 text-purple-600 mb-4">Account & Privacy</h2>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">Is my personal information visible?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                Only your username and chosen contact method are public. Your email address is kept private unless
                                you choose to share it or use it for an Escrow transaction (where it is visible to the other party).
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">Can I delete my account?</h3>
                            <p className="dark:text-gray-300 text-gray-700">
                                Yes, you can delete your account and all data at any time from the Settings page.
                            </p>
                        </div>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t dark:border-white/10 border-gray-200 text-center">
                    <p className="dark:text-gray-400 text-gray-600">
                        Still have questions? <Link href="/contact" className="dark:text-amber-500 text-amber-600 dark:hover:text-amber-400 hover:text-amber-700">Contact Us</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
