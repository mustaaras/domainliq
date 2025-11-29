export default function SellerGuidePage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-4xl mx-auto prose prose-invert">
                <h1 className="text-4xl font-bold mb-4">Seller's Guide</h1>
                <p className="text-gray-400 mb-8">How to successfully sell domains on DomainLiq</p>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 my-6">
                    <p className="font-bold text-green-400 mb-2">✓ Free Platform!</p>
                    <p className="text-gray-300">
                        DomainLiq is completely free to use. No listing fees, no commission, no hidden costs.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 1: Create Your Account</h2>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>Click "Sign Up" in the top navigation</li>
                    <li>Provide your name, email, and password</li>
                    <li>Choose a username (this becomes your store URL: domainliq.com/u/yourname)</li>
                    <li>Accept Terms of Service and Privacy Policy</li>
                    <li>Verify your email address</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 2: Configure Your Profile</h2>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>Go to Settings from your dashboard</li>
                    <li>Add your contact information (email, X/Twitter, WhatsApp, LinkedIn, Telegram)</li>
                    <li>Set your preferred contact method</li>
                    <li>Update your display name if desired</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 3: Add Domains</h2>

                <h3 className="text-xl font-semibold mt-6 mb-3">Single Domain:</h3>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>Enter the domain name (e.g., example.com)</li>
                    <li>Set your asking price in USD</li>
                    <li>Click "Add Domain"</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">Bulk Upload (up to 50):</h3>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>Use the bulk upload textarea</li>
                    <li>Format: one domain per line as "domain.com price"</li>
                    <li>Example:
                        <pre className="bg-black/40 p-3 rounded mt-2 text-sm">
                            example.com 1000{'\n'}
                            test.com 500{'\n'}
                            domain.com 2500
                        </pre>
                    </li>
                    <li>Click "Upload Domains"</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 4: Verify Ownership (Recommended)</h2>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>Go to your Dashboard</li>
                    <li>Click the "Verify" button next to your domain</li>
                    <li>Copy the unique verification token (e.g., domainliq-xyz123)</li>
                    <li>Add a <strong>TXT record</strong> to your domain's DNS settings with this token</li>
                    <li>Click "Check Now" to verify</li>
                    <li><strong>Benefit:</strong> Verified domains get a green shield badge, increasing buyer trust!</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 5: Manage Your Listings</h2>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li><strong>Mark as Sold:</strong> Click the gold ✓ button when a domain sells</li>
                    <li><strong>Mark as Available:</strong> Click the green ↺ button to relist</li>
                    <li><strong>Delete:</strong> Use the trash icon to remove a domain permanently</li>
                    <li>Sold domains stay visible but are grayed out and marked "SOLD"</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 5: Share Your Store</h2>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>Your unique URL: domainliq.com/u/yourname</li>
                    <li>Share on social media (X, LinkedIn, Reddit, etc.)</li>
                    <li>When shared, a preview shows your domain list automatically!</li>
                    <li>Add to your email signature</li>
                    <li>Include in domain forums and communities</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 6: Respond to Inquiries</h2>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>Buyers will contact you through your preferred method</li>
                    <li>Respond promptly and professionally</li>
                    <li>Provide proof of ownership if requested</li>
                    <li>Be clear about transfer process and timeline</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 7: Complete the Sale</h2>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 my-6">
                    <p className="font-bold text-amber-400 mb-2">⚠️ Use Escrow!</p>
                    <p className="text-gray-300 mb-2">
                        Always recommend escrow services to buyers for safe transactions:
                    </p>
                    <ul className="list-disc pl-6 text-gray-300">
                        <li>Escrow.com (most trusted)</li>
                        <li>Afternic.com</li>
                        <li>Sedo.com</li>
                    </ul>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">Pricing Tips</h2>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>Research similar domain sales</li>
                    <li>Consider domain length, keywords, extension (.com is premium)</li>
                    <li>Be realistic but don't undersell</li>
                    <li>You can update prices anytime by deleting and re-adding</li>
                    <li>Bundle discounts can attract buyers</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Best Practices</h2>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>Keep your domain list updated</li>
                    <li>Mark sold domains promptly</li>
                    <li>Respond to all legitimate inquiries</li>
                    <li>Be transparent about domain history</li>
                    <li>Unlock domains before negotiating</li>
                    <li>Have authorization codes ready</li>
                    <li>Set realistic transfer timelines</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">What NOT to Do</h2>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 my-6">
                    <ul className="list-disc pl-6 text-gray-300">
                        <li>Don't list domains you don't own</li>
                        <li>Don't refuse escrow services</li>
                        <li>Don't request payment outside escrow</li>
                        <li>Don't provide false ownership information</li>
                        <li>Don't spam or harass buyers</li>
                    </ul>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">Security & Privacy</h2>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>We NEVER sell or share your contact information</li>
                    <li>Only buyers who select your domains see your contact info</li>
                    <li>Change your password regularly</li>
                    <li>Use strong, unique passwords</li>
                    <li>Enable 2FA on your email account</li>
                </ul>

                <div className="mt-12 pt-8 border-t border-white/10 text-center">
                    <p className="text-gray-400">
                        Ready to start selling? Create your account today!
                    </p>
                    <p className="text-gray-500 mt-4">
                        Happy selling! 🚀
                    </p>
                </div>
            </div>
        </div>
    );
}
