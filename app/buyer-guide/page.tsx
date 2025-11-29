export default function UserGuidePage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-4xl mx-auto prose prose-invert">
                <h1 className="text-4xl font-bold mb-4">Buyer's Guide</h1>
                <p className="text-gray-400 mb-8">How to safely buy domains on DomainLiq</p>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 my-6">
                    <p className="font-bold text-amber-400 mb-2">⚠️ Safety First!</p>
                    <p className="text-gray-300">
                        DomainLiq does NOT process payments or act as escrow. Always use trusted third-party escrow services for transactions.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 1: Browse Domains</h2>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>Visit the homepage to see all recently added domains</li>
                    <li>Use the search bar to find specific domains</li>
                    <li>Check domain prices and seller information</li>
                    <li>Look at seller profiles (click on username) to see all their listings</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 2: Select Domains</h2>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>On a seller's profile page, click domains to select them</li>
                    <li>Selected domains show a checkmark and gold highlight</li>
                    <li>You can select multiple domains at once</li>
                    <li>A floating "Contact Seller" button appears when domains are selected</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 3: Contact the Seller</h2>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>Click the "Contact Seller" button</li>
                    <li>Choose your preferred contact method (Email, X/Twitter, WhatsApp, LinkedIn, Telegram)</li>
                    <li>A pre-filled message with selected domains will be prepared</li>
                    <li>Introduce yourself and express interest professionally</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 4: Negotiate</h2>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>Discuss price, transfer terms, and timeline</li>
                    <li>Ask for proof of domain ownership</li>
                    <li>Verify the domain is unlocked and ready for transfer</li>
                    <li>Get details about the domain's history and traffic (if relevant)</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 5: Use Escrow</h2>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 my-6">
                    <p className="font-bold text-green-400 mb-2">Recommended Escrow Services:</p>
                    <ul className="list-disc pl-6 text-gray-300">
                        <li><strong>Escrow.com</strong> - Most trusted for domain transactions</li>
                        <li><strong>Dan.com</strong> - Popular domain marketplace with built-in escrow</li>
                        <li><strong>Sedo.com</strong> - Another trusted option</li>
                    </ul>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 6: Complete Transfer</h2>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>Follow escrow service instructions</li>
                    <li>Provide payment through escrow</li>
                    <li>Seller initiates domain transfer</li>
                    <li>Confirm receipt of domain before escrow releases funds</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Red Flags to Watch For</h2>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 my-6">
                    <ul className="list-disc pl-6 text-gray-300">
                        <li>Seller refuses to use escrow</li>
                        <li>Demands payment via cryptocurrency, gift cards, or wire transfer</li>
                        <li>Can't provide proof of ownership</li>
                        <li>Price is too good to be true</li>
                        <li>Pressures you to act quickly</li>
                        <li>Won't communicate through DomainLiq contact methods</li>
                    </ul>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">Tips for Success</h2>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>Research the domain's history using WHOIS lookup</li>
                    <li>Check domain age and previous ownership</li>
                    <li>Verify there are no trademark issues</li>
                    <li>Understand transfer fees from your registrar</li>
                    <li>Keep all communication documented</li>
                    <li>Be patient - good deals take time</li>
                </ul>

                <div className="mt-12 pt-8 border-t border-white/10 text-center">
                    <p className="text-gray-400">
                        Need help? Have questions? Contact us through our support channels.
                    </p>
                    <p className="text-gray-500 mt-4">
                        Happy domain hunting! 🎯
                    </p>
                </div>
            </div>
        </div>
    );
}
