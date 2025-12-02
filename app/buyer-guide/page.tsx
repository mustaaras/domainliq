import Link from 'next/link';

export default function UserGuidePage() {
    return (
        <div className="min-h-screen dark:bg-[#050505] bg-gray-50 dark:text-white text-gray-900 p-8">
            <div className="max-w-4xl mx-auto prose dark:prose-invert">
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <img src="/logo.svg" alt="DomainLiq" className="h-8 w-auto cursor-pointer dark:bg-transparent bg-black rounded p-1" />
                    </Link>
                </div>
                <h1 className="text-4xl font-bold mb-4 dark:text-white text-gray-900">Buyer's Guide</h1>
                <p className="dark:text-gray-400 text-gray-600 mb-8">How to safely buy domains on DomainLiq</p>

                <div className="dark:bg-amber-500/10 bg-amber-50 border dark:border-amber-500/30 border-amber-300 rounded-lg p-6 my-6">
                    <p className="font-bold dark:text-amber-400 text-amber-700 mb-2">⚠️ Safety First!</p>
                    <p className="dark:text-gray-300 text-gray-700">
                        DomainLiq does NOT process payments or act as escrow. Always use trusted third-party escrow services for transactions.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white text-gray-900">Step 1: Browse Domains</h2>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>Visit the homepage to see all recently added domains (priced under $1,000 for quick liquidation)</li>
                    <li>Use the search bar to find specific domains</li>
                    <li><strong>Look for the Green Shield:</strong> Domains with a green shield badge have verified ownership!</li>
                    <li>Check domain prices and seller information</li>
                    <li>Look at seller profiles (click on username) to see all their listings</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white text-gray-900">Step 2: Select Domains</h2>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>On a seller's profile page, click domains to select them</li>
                    <li>Selected domains show a checkmark and gold highlight</li>
                    <li>You can select multiple domains at once</li>
                    <li>A floating "Contact Seller" button appears when domains are selected</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white text-gray-900">Step 3: Contact the Seller</h2>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>Click the "Contact Seller" button</li>
                    <li>Choose your preferred contact method (Email, X/Twitter, WhatsApp, LinkedIn, Telegram)</li>
                    <li>A pre-filled message with selected domains will be prepared</li>
                    <li>Introduce yourself and express interest professionally</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white text-gray-900">Step 4: Negotiate</h2>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>Discuss price, transfer terms, and timeline</li>
                    <li>Ask for proof of domain ownership</li>
                    <li>Verify the domain is unlocked and ready for transfer</li>
                    <li>Get details about the domain's history and traffic (if relevant)</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white text-gray-900">Step 5: Use "Buy with Escrow"</h2>
                <div className="dark:bg-green-500/10 bg-green-50 border dark:border-green-500/30 border-green-300 rounded-lg p-6 my-6">
                    <p className="font-bold dark:text-green-400 text-green-700 mb-2">Secure Integrated Payments:</p>
                    <p className="dark:text-gray-300 text-gray-700 mb-4">
                        We have integrated directly with <strong>Escrow.com</strong> for seamless security.
                    </p>
                    <ol className="list-decimal pl-6 dark:text-gray-300 text-gray-700 space-y-2">
                        <li>Click the <strong>"Buy with Escrow"</strong> button on any domain listing</li>
                        <li>Enter your email address in the secure pop-up</li>
                        <li>You will be automatically redirected to Escrow.com</li>
                        <li>Complete your payment securely on their platform</li>
                    </ol>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white text-gray-900">Step 6: Complete Transfer</h2>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>Follow escrow service instructions</li>
                    <li>Provide payment through escrow</li>
                    <li>Seller initiates domain transfer</li>
                    <li>Confirm receipt of domain before escrow releases funds</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white text-gray-900">Red Flags to Watch For</h2>
                <div className="dark:bg-red-500/10 bg-red-50 border dark:border-red-500/30 border-red-300 rounded-lg p-6 my-6">
                    <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700">
                        <li>Seller refuses to use escrow</li>
                        <li>Demands payment via cryptocurrency, gift cards, or wire transfer</li>
                        <li>Can't provide proof of ownership</li>
                        <li>Price is too good to be true</li>
                        <li>Pressures you to act quickly</li>
                        <li>Won't communicate through DomainLiq contact methods</li>
                    </ul>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4 dark:text-white text-gray-900">Tips for Success</h2>
                <ul className="list-disc pl-6 dark:text-gray-300 text-gray-700 mb-4">
                    <li>Research the domain's history using WHOIS lookup</li>
                    <li>Check domain age and previous ownership</li>
                    <li>Verify there are no trademark issues</li>
                    <li>Understand transfer fees from your registrar</li>
                    <li>Keep all communication documented</li>
                    <li>Be patient - good deals take time</li>
                </ul>

                <div className="mt-12 pt-8 border-t dark:border-white/10 border-gray-200 text-center">
                    <p className="dark:text-gray-400 text-gray-600">
                        Need help? Have questions? Contact us through our support channels.
                    </p>
                    <p className="dark:text-gray-500 text-gray-500 mt-4">
                        Happy domain hunting! 🎯
                    </p>
                </div>
            </div>
        </div>
    );
}
