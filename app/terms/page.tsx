import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="min-h-screen dark:bg-[#050505] bg-gray-50 dark:text-white text-gray-900 p-8">
            <div className="max-w-4xl mx-auto prose dark:prose-invert">
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <img src="/logo.svg" alt="DomainLiq" className="h-8 w-auto cursor-pointer dark:bg-transparent bg-black rounded p-1" />
                    </Link>
                </div>
                <h1 className="text-4xl font-bold mb-4 dark:text-white text-gray-900">Terms of Service</h1>
                <p className="dark:text-gray-400 text-gray-600 mb-8">Last Updated: November 29, 2025</p>

                <h2 className="text-2xl font-bold mt-8 mb-4">Welcome to DomainLiq</h2>
                <p className="dark:text-gray-300 text-gray-700 mb-4">
                    These Terms of Service ("Terms") govern your use of DomainLiq ("Service", "Platform", "we", "us", or "our"),
                    a Domain Liquidation Platform. By accessing or using our Service, you agree to be bound by these Terms.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">1. Service Description</h2>
                <p className="dark:text-gray-300 text-gray-700 mb-4">
                    DomainLiq is a free, open marketplace platform that connects domain sellers with potential buyers. We provide:
                </p>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>A listing platform for domain sellers</li>
                    <li>A browsing and search interface for buyers</li>
                    <li>Contact facilitation between parties</li>
                </ul>

                <div className="dark:bg-amber-500/10 bg-amber-50 border dark:border-amber-500/30 border-amber-300 rounded-lg p-6 my-6">
                    <p className="font-bold dark:text-amber-400 text-amber-700 mb-2">IMPORTANT: DomainLiq does NOT:</p>
                    <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700">
                        <li>Process payments directly</li>
                        <li>Hold funds (we use Escrow.com for this)</li>
                        <li>Guarantee legal ownership title (Verification via TXT record or ns3verify.domainliq.com proves DNS control only)</li>
                        <li>Mediate disputes (handled by Escrow.com for secured transactions)</li>
                    </ul>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">2. User Responsibilities</h2>

                <h3 className="text-xl font-semibold mt-6 mb-3">For Sellers:</h3>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>You must have legitimate ownership or authorization to sell listed domains</li>
                    <li>You are responsible for all domain listings and pricing</li>
                    <li>You must respond to legitimate buyer inquiries</li>
                    <li>You must complete transactions independently or via our Escrow.com integration</li>
                    <li>You are solely responsible for domain transfers</li>
                    <li><strong>Homepage Listing:</strong> Only domains priced under $1,000 are eligible for homepage featuring. All domains remain visible on your profile page.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">For Buyers:</h3>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li className="font-bold text-amber-400">ONLY PURCHASE FROM TRUSTED SELLERS</li>
                    <li>Verify domain ownership before making any payment</li>
                    <li>Conduct all due diligence independently</li>
                    <li><strong>Use our "Buy with Escrow" feature</strong> for secure transactions via Escrow.com</li>
                    <li>Never share payment information outside of the secure Escrow.com environment</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">3. Payment & Escrow</h2>
                <div className="dark:bg-green-500/10 bg-green-50 border dark:border-green-500/30 border-green-300 rounded-lg p-6 my-6">
                    <p className="font-bold dark:text-green-400 text-green-700 mb-2">SECURE TRANSACTIONS:</p>
                    <p className="dark:text-gray-300 text-gray-700">
                        DomainLiq integrates with <strong>Escrow.com</strong> to facilitate secure domain purchases.
                        When you use "Buy with Escrow", a transaction is created on Escrow.com, and you are redirected
                        to their secure platform to complete payment.
                    </p>
                    <p className="dark:text-gray-300 text-gray-700 mt-4">
                        DomainLiq does not touch your funds. All payments are held by Escrow.com until the domain transfer is verified.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">4. Privacy & Data Usage</h2>
                <p className="dark:text-gray-300 text-gray-700 mb-4">DomainLiq respects your privacy:</p>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>We collect minimal information (email, username, domain listings)</li>
                    <li>We DO NOT sell your information to third parties</li>
                    <li>We DO NOT use your data for advertising</li>
                    <li>We DO NOT share your contact information without your consent</li>
                    <li>See our Privacy Policy for full details</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">5. Prohibited Activities</h2>
                <p className="dark:text-gray-300 text-gray-700 mb-4">Users may NOT:</p>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>List domains they don't own or have authority to sell</li>
                    <li>Engage in fraudulent activities</li>
                    <li>Harass other users</li>
                    <li>Spam or send unsolicited messages</li>
                    <li>Violate any laws or regulations</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">6. Disclaimers</h2>
                <p className="dark:text-gray-300 text-gray-700 mb-4">
                    DomainLiq is provided "AS IS" without warranties of any kind. We disclaim all warranties regarding
                    merchantability, fitness for a particular purpose, and accuracy of listings.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">7. Limitation of Liability</h2>
                <p className="dark:text-gray-300 text-gray-700 mb-4">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, we are not liable for any damages arising from use of the Service,
                    user transactions, or domain transfer failures.
                </p>

                <div className="mt-12 pt-8 border-t dark:border-white/10 border-gray-200">
                    <p className="dark:text-gray-400 text-gray-600 text-sm">
                        For questions about these Terms, please contact us through our support channels.
                    </p>
                </div>
            </div>
        </div>
    );
}
