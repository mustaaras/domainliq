export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-4xl mx-auto prose prose-invert">
                <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                <p className="text-gray-400 mb-8">Last Updated: November 29, 2025</p>

                <h2 className="text-2xl font-bold mt-8 mb-4">Welcome to DomainLiq</h2>
                <p className="text-gray-300 mb-4">
                    These Terms of Service ("Terms") govern your use of DomainLiq ("Service", "Platform", "we", "us", or "our"),
                    a domain marketplace platform. By accessing or using our Service, you agree to be bound by these Terms.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">1. Service Description</h2>
                <p className="text-gray-300 mb-4">
                    DomainLiq is a free, open marketplace platform that connects domain sellers with potential buyers. We provide:
                </p>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>A listing platform for domain sellers</li>
                    <li>A browsing and search interface for buyers</li>
                    <li>Contact facilitation between parties</li>
                </ul>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 my-6">
                    <p className="font-bold text-amber-400 mb-2">IMPORTANT: DomainLiq does NOT:</p>
                    <ul className="list-disc pl-6 text-gray-300">
                        <li>Process payments</li>
                        <li>Act as an escrow service</li>
                        <li>Verify domain ownership</li>
                        <li>Guarantee transactions</li>
                        <li>Mediate disputes</li>
                    </ul>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">2. User Responsibilities</h2>

                <h3 className="text-xl font-semibold mt-6 mb-3">For Sellers:</h3>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>You must have legitimate ownership or authorization to sell listed domains</li>
                    <li>You are responsible for all domain listings and pricing</li>
                    <li>You must respond to legitimate buyer inquiries</li>
                    <li>You must complete transactions independently</li>
                    <li>You are solely responsible for domain transfers</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">For Buyers:</h3>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li className="font-bold text-amber-400">ONLY PURCHASE FROM TRUSTED SELLERS</li>
                    <li>Verify domain ownership before making any payment</li>
                    <li>Conduct all due diligence independently</li>
                    <li>Use secure escrow services for transactions (we recommend Escrow.com)</li>
                    <li>Never share payment information through our platform</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">3. No Payment Processing</h2>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 my-6">
                    <p className="font-bold text-red-400 mb-2">CRITICAL NOTICE:</p>
                    <p className="text-gray-300">
                        DomainLiq does NOT handle payments. All financial transactions must be completed through trusted
                        third-party escrow services or directly between buyer and seller (at your own risk).
                    </p>
                    <p className="text-gray-300 mt-4">
                        We are not responsible for any financial losses, fraud, or disputes arising from transactions.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">4. Privacy & Data Usage</h2>
                <p className="text-gray-300 mb-4">DomainLiq respects your privacy:</p>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>We collect minimal information (email, username, domain listings)</li>
                    <li>We DO NOT sell your information to third parties</li>
                    <li>We DO NOT use your data for advertising</li>
                    <li>We DO NOT share your contact information without your consent</li>
                    <li>See our Privacy Policy for full details</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">5. Prohibited Activities</h2>
                <p className="text-gray-300 mb-4">Users may NOT:</p>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>List domains they don't own or have authority to sell</li>
                    <li>Engage in fraudulent activities</li>
                    <li>Harass other users</li>
                    <li>Spam or send unsolicited messages</li>
                    <li>Violate any laws or regulations</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">6. Disclaimers</h2>
                <p className="text-gray-300 mb-4">
                    DomainLiq is provided "AS IS" without warranties of any kind. We disclaim all warranties regarding
                    merchantability, fitness for a particular purpose, and accuracy of listings.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">7. Limitation of Liability</h2>
                <p className="text-gray-300 mb-4">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, we are not liable for any damages arising from use of the Service,
                    user transactions, or domain transfer failures.
                </p>

                <div className="mt-12 pt-8 border-t border-white/10">
                    <p className="text-gray-400 text-sm">
                        For questions about these Terms, please contact us through our support channels.
                    </p>
                </div>
            </div>
        </div>
    );
}
