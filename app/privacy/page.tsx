export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-4xl mx-auto prose prose-invert">
                <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                <p className="text-gray-400 mb-8">Last Updated: November 29, 2025</p>

                <h2 className="text-2xl font-bold mt-8 mb-4">Our Commitment to Privacy</h2>
                <p className="text-gray-300 mb-4">
                    At DomainLiq, we believe in transparency and protecting your privacy. This Privacy Policy explains
                    how we collect, use, and protect your information.
                </p>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 my-6">
                    <p className="font-bold text-green-400 mb-2">Our Privacy Promise:</p>
                    <ul className="list-disc pl-6 text-gray-300">
                        <li>We DO NOT sell your personal information</li>
                        <li>We DO NOT use your data for advertising</li>
                        <li>We collect only what's necessary for the platform to function</li>
                        <li>You control your data and can delete it at any time</li>
                    </ul>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>

                <h3 className="text-xl font-semibold mt-6 mb-3">Account Information:</h3>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>Email address (for authentication)</li>
                    <li>Username/subdomain (for your public profile)</li>
                    <li>Password (securely hashed, we never see your actual password)</li>
                    <li>Display name (optional)</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">Contact Information (Optional):</h3>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>Preferred contact method (email, X/Twitter, WhatsApp, LinkedIn, Telegram)</li>
                    <li>Contact handles only (we never access your messages)</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">Domain Listings & Verification:</h3>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>Domain names you list</li>
                    <li>Prices you set</li>
                    <li>Domain descriptions (optional)</li>
                    <li>Domain status (available/sold)</li>
                    <li>DNS verification records (accessed publicly to verify ownership)</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-300 mb-4">We use your information ONLY to:</p>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>Authenticate your account</li>
                    <li>Display your public domain listings</li>
                    <li>Enable buyers to contact you through your preferred method</li>
                    <li>Improve platform functionality</li>
                    <li>Send essential service notifications (security alerts, policy changes)</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">3. What We DO NOT Do</h2>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 my-6">
                    <ul className="list-disc pl-6 text-gray-300">
                        <li>We DO NOT sell your information to anyone</li>
                        <li>We DO NOT share your data with advertisers</li>
                        <li>We DO NOT send marketing emails (unless you opt-in)</li>
                        <li>We DO NOT track you across other websites</li>
                        <li>We DO NOT access your messages with buyers/sellers</li>
                    </ul>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">4. Information Sharing</h2>
                <p className="text-gray-300 mb-4">Your information is shared in these limited ways:</p>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li><strong>Public Profile:</strong> Your username, display name, and domain listings are publicly visible</li>
                    <li><strong>Contact Information:</strong> Your chosen contact method is shown to interested buyers</li>
                    <li><strong>Legal Requirements:</strong> We may disclose information if required by law</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">5. Cookies</h2>
                <p className="text-gray-300 mb-4">We use minimal cookies for:</p>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>Keeping you logged in</li>
                    <li>Remembering your preferences</li>
                    <li>Understanding if you've accepted our terms</li>
                </ul>
                <p className="text-gray-300 mb-4">
                    We DO NOT use tracking cookies. We DO NOT use third-party advertising cookies.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">6. Data Security</h2>
                <p className="text-gray-300 mb-4">We protect your data through:</p>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>Encrypted connections (HTTPS)</li>
                    <li>Secure password hashing (bcrypt)</li>
                    <li>Regular security updates</li>
                    <li>Limited data retention</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">7. Your Rights</h2>
                <p className="text-gray-300 mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 text-gray-300 mb-4">
                    <li>Access your data at any time</li>
                    <li>Update your information in Settings</li>
                    <li>Delete your account and all associated data</li>
                    <li>Export your domain listings</li>
                    <li>Opt-out of non-essential communications</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">8. Children's Privacy</h2>
                <p className="text-gray-300 mb-4">
                    DomainLiq is not intended for users under 18 years of age. We do not knowingly collect information
                    from children.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">9. Third-Party Services</h2>
                <p className="text-gray-300 mb-4">
                    When you choose to contact sellers via X, WhatsApp, LinkedIn, or Telegram, you're using their services
                    and their privacy policies apply. We do not control or access those communications.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">10. Changes to This Policy</h2>
                <p className="text-gray-300 mb-4">
                    We may update this Privacy Policy. We'll notify you of significant changes via email or platform notice.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">11. Contact Us</h2>
                <p className="text-gray-300 mb-4">
                    Questions about privacy? Contact us through our support channels. We're here to help.
                </p>

                <div className="mt-12 pt-8 border-t border-white/10">
                    <p className="text-gray-400 text-sm">
                        DomainLiq is a free, open platform built on trust and transparency. Your privacy matters to us.
                    </p>
                </div>
            </div>
        </div>
    );
}
