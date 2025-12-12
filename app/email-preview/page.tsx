'use client';

import { useState } from 'react';

export default function EmailPreviewPage() {
    const [view, setView] = useState<'welcome' | 'reset_password' | 'seller_sale' | 'buyer_purchase' | 'auth_code' | 'payout' | 'auto_release'>('seller_sale');

    const domainName = 'example.com';
    const amountFormatted = '50.00';
    const payoutFormatted = '45.00'; // After 10% fee
    const userName = 'Aras';
    const resetUrl = 'https://domainliq.com/reset-password?token=123';
    const subDomain = 'cool-seller';
    const year = new Date().getFullYear();

    const getHtml = () => {
        const header = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>DomainLiq Notification</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                                <!-- Header -->
                                <tr>
                                    <td style="padding: 32px; background-color: #000000; text-align: center;">
                                        <img src="https://domainliq.com/icon-512.png" alt="DomainLiq" width="48" height="48" style="display: inline-block; vertical-align: middle;">
                                        <span style="color: #ffffff; font-size: 24px; font-weight: bold; vertical-align: middle; margin-left: 12px;">DomainLiq</span>
                                    </td>
                                </tr>
                                <!-- Content -->
                                <tr>
                                    <td style="padding: 40px 32px;">
        `;

        const footer = `
                                    </td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 32px; background-color: #F3F4F6; text-align: center;">
                                        <p style="margin: 0 0 16px 0; color: #6B7280; font-size: 14px;">
                                            Need help? Contact us at <a href="mailto:support@domainliq.com" style="color: #F59E0B; text-decoration: none;">support@domainliq.com</a>
                                        </p>
                                        <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                                            &copy; ${year} DomainLiq. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        let content = '';

        switch (view) {
            case 'welcome':
                content = `
                    <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin: 0 0 24px 0; text-align: center;">Welcome to DomainLiq! 🎉</h1>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
                        Hi ${userName},
                    </p>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
                        Thanks for joining DomainLiq! Your seller page is now live and ready to view.
                    </p>

                    <div style="background-color: #FFFBEB; border: 1px solid #FCD34D; border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: center;">
                        <p style="margin: 0 0 12px 0; color: #92400E; font-weight: 600;">Your Storefront URL:</p>
                        <a href="https://${subDomain}.domainliq.com" style="color: #F59E0B; font-size: 18px; font-weight: bold; text-decoration: none;">https://${subDomain}.domainliq.com</a>
                    </div>
                    
                    <h3 style="color: #111827; font-size: 18px; font-weight: bold; margin: 0 0 16px 0;">Get Started:</h3>
                    
                    <div style="margin-bottom: 32px;">
                         <div style="display: flex; margin-bottom: 16px;">
                            <div style="width: 24px; height: 24px; background-color: #F3F4F6; color: #374151; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 14px; margin-right: 12px; flex-shrink: 0;">1</div>
                            <span style="color: #374151;">Add your first domain for sale</span>
                        </div>
                        <div style="display: flex; margin-bottom: 16px;">
                            <div style="width: 24px; height: 24px; background-color: #F3F4F6; color: #374151; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 14px; margin-right: 12px; flex-shrink: 0;">2</div>
                            <span style="color: #374151;">Verify your ownership (via DNS)</span>
                        </div>
                        <div style="display: flex;">
                            <div style="width: 24px; height: 24px; background-color: #F3F4F6; color: #374151; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 14px; margin-right: 12px; flex-shrink: 0;">3</div>
                            <span style="color: #374151;">Connect Stripe to get paid</span>
                        </div>
                    </div>

                    <div style="text-align: center;">
                        <a href="https://domainliq.com/dashboard" style="display: inline-block; background-color: #F59E0B; color: #ffffff; font-weight: bold; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2);">
                            Go to Dashboard
                        </a>
                    </div>
                `;
                break;

            case 'reset_password':
                content = `
                    <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin: 0 0 24px 0; text-align: center;">Reset Your Password 🔒</h1>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
                        Hi ${userName},
                    </p>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 32px;">
                        We received a request to reset your password. Click the button below to choose a new one. This link is valid for 1 hour.
                    </p>

                    <div style="text-align: center; margin-bottom: 32px;">
                        <a href="${resetUrl}" style="display: inline-block; background-color: #F59E0B; color: #ffffff; font-weight: bold; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2);">
                            Reset Password
                        </a>
                    </div>
                    
                    <p style="color: #6B7280; font-size: 14px; text-align: center;">
                        If you didn't request this, you can safely ignore this email.
                    </p>
                `;
                break;

            case 'seller_sale':
                content = `
                    <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin: 0 0 24px 0; text-align: center;">Congratulations! You made a sale! 🎉</h1>
                    
                    <div style="background-color: #FFFBEB; border: 1px solid #FCD34D; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td style="padding-bottom: 8px;">
                                    <p style="margin: 0; color: #92400E; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Domain Sold</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-bottom: 16px;">
                                    <p style="margin: 0; color: #111827; font-size: 20px; font-weight: bold;">${domainName}</p>
                                </td>
                            </tr>
                             <tr>
                                <td style="padding-bottom: 8px;">
                                    <p style="margin: 0; color: #92400E; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Sale Price</p>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p style="margin: 0; color: #059669; font-size: 24px; font-weight: bold;">$${amountFormatted}</p>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
                        The buyer has completed payment. Now proceed to your dashboard to complete the transfer.
                    </p>

                    <h3 style="color: #111827; font-size: 18px; font-weight: bold; margin: 0 0 16px 0;">Next Steps:</h3>

                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                        <tr>
                            <td width="32" valign="top" style="padding-bottom: 24px;">
                                <div style="width: 24px; height: 24px; background-color: #F59E0B; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 14px;">1</div>
                            </td>
                            <td style="padding-left: 16px; padding-bottom: 24px;">
                                <strong style="display: block; color: #111827; margin-bottom: 4px;">Unlock Your Domain</strong>
                                <span style="color: #4B5563; font-size: 14px;">Log in to your registrar and unlock ${domainName}.</span>
                            </td>
                        </tr>
                        <tr>
                            <td width="32" valign="top" style="padding-bottom: 24px;">
                                <div style="width: 24px; height: 24px; background-color: #F59E0B; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 14px;">2</div>
                            </td>
                            <td style="padding-left: 16px; padding-bottom: 24px;">
                                <strong style="display: block; color: #111827; margin-bottom: 4px;">Get Auth Code</strong>
                                <span style="color: #4B5563; font-size: 14px;">Get the EPP/Auth code from your registrar.</span>
                            </td>
                        </tr>
                        <tr>
                            <td width="32" valign="top">
                                <div style="width: 24px; height: 24px; background-color: #F59E0B; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 14px;">3</div>
                            </td>
                            <td style="padding-left: 16px;">
                                <strong style="display: block; color: #111827; margin-bottom: 4px;">Complete Transfer</strong>
                                <span style="color: #4B5563; font-size: 14px;">Enter the code in your dashboard to start the transfer.</span>
                            </td>
                        </tr>
                    </table>

                    <div style="text-align: center;">
                        <a href="https://domainliq.com/dashboard/orders" style="display: inline-block; background-color: #F59E0B; color: #ffffff; font-weight: bold; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2);">
                            Go to Orders Dashboard
                        </a>
                    </div>
                `;
                break;

            case 'buyer_purchase':
                content = `
                    <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin: 0 0 24px 0; text-align: center;">Order Confirmed! ✅</h1>
                    
                    <div style="background-color: #ECFDF5; border: 1px solid #6EE7B7; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td style="padding-bottom: 8px;">
                                    <p style="margin: 0; color: #065F46; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">You Purchased</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-bottom: 16px;">
                                    <p style="margin: 0; color: #111827; font-size: 20px; font-weight: bold;">${domainName}</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-bottom: 8px;">
                                    <p style="margin: 0; color: #065F46; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Amount Paid</p>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p style="margin: 0; color: #059669; font-size: 24px; font-weight: bold;">$${amountFormatted}</p>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <h3 style="color: #111827; font-size: 18px; font-weight: bold; margin: 0 0 16px 0;">What happens next?</h3>

                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                        <tr>
                            <td width="32" valign="top" style="padding-bottom: 24px;">
                                <div style="width: 24px; height: 24px; background-color: #F59E0B; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 14px;">1</div>
                            </td>
                            <td style="padding-left: 16px; padding-bottom: 24px;">
                                <strong style="display: block; color: #111827; margin-bottom: 4px;">Wait for Auth Code</strong>
                                <span style="color: #4B5563; font-size: 14px;">The seller will provide the authorization code. We'll email it to you as soon as we receive it.</span>
                            </td>
                        </tr>
                        <tr>
                            <td width="32" valign="top" style="padding-bottom: 24px;">
                                <div style="width: 24px; height: 24px; background-color: #F59E0B; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 14px;">2</div>
                            </td>
                            <td style="padding-left: 16px; padding-bottom: 24px;">
                                <strong style="display: block; color: #111827; margin-bottom: 4px;">Transfer Domain</strong>
                                <span style="color: #4B5563; font-size: 14px;">Use the code to transfer the domain to your registrar (GoDaddy, Namecheap, etc.).</span>
                            </td>
                        </tr>
                        <tr>
                            <td width="32" valign="top">
                                <div style="width: 24px; height: 24px; background-color: #F59E0B; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold; font-size: 14px;">3</div>
                            </td>
                            <td style="padding-left: 16px;">
                                <strong style="display: block; color: #111827; margin-bottom: 4px;">Confirm Receipt</strong>
                                <span style="color: #4B5563; font-size: 14px;">Click the link in the transfer email to confirm you received the domain.</span>
                            </td>
                        </tr>
                    </table>
                    
                    <div style="padding: 16px; background-color: #F3F4F6; border-radius: 8px; border-left: 4px solid #F59E0B;">
                        <p style="margin: 0; color: #4B5563; font-size: 14px;">
                            <strong>🔒 Buyer Protection:</strong> Your funds are held securely until you confirm the transfer.
                        </p>
                    </div>
                `;
                break;

            case 'auth_code':
                content = `
                    <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin: 0 0 24px 0; text-align: center;">Action Required: Your Domain is Ready 🔑</h1>
                    
                    <div style="background-color: #ECFDF5; border: 1px solid #6EE7B7; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                        <p style="color: #065F46; font-size: 18px; font-weight: 500; margin: 0 0 8px 0;">The seller has released the domain:</p>
                         <p style="margin: 0; color: #111827; font-size: 24px; font-weight: bold;">${domainName}</p>
                    </div>

                    <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
                        We have securely received the <strong>Authorization Code (EPP)</strong> from the seller. You can now start the transfer to your own registrar.
                    </p>

                    <div style="text-align: center; margin-bottom: 32px;">
                        <a href="https://domainliq.com/order/reveal" style="display: inline-block; background-color: #4F46E5; color: #ffffff; font-weight: bold; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
                            Reveal Auth Code
                        </a>
                    </div>

                    <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; font-size: 14px; text-align: center; color: #4B5563;">
                         <strong>Why click?</strong> For security, we never send auth codes directly via email.
                    </div>
                 `;
                break;

            case 'payout':
                content = `
                    <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin: 0 0 24px 0; text-align: center;">Payout Sent! 💰</h1>
                    
                    <div style="text-align: center; margin-bottom: 32px;">
                        <p style="font-size: 48px; margin: 0;">💸</p>
                    </div>

                    <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px; text-align: center;">
                        Great news! The buyer has confirmed receipt of <strong>${domainName}</strong>. We've just sent your payout.
                    </p>

                    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 12px;">
                            <span style="color: #6B7280;">Sale Price</span>
                            <span style="font-weight: 600; color: #111827;">$${amountFormatted}</span>
                        </div>
                         <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 12px;">
                            <span style="color: #6B7280;">Platform Fee (10%)</span>
                            <span style="font-weight: 600; color: #EF4444;">-$5.00</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-top: 4px;">
                            <span style="color: #111827; font-weight: bold;">You Receive</span>
                            <span style="font-weight: bold; color: #059669; font-size: 18px;">$${payoutFormatted}</span>
                        </div>
                    </div>
                    
                    <p style="color: #6B7280; font-size: 14px; text-align: center;">
                        Funds should appear in your Stripe account within 2-3 business days.
                    </p>
                 `;
                break;

            case 'auto_release':
                content = `
                    <h1 style="color: #111827; font-size: 24px; font-weight: bold; margin: 0 0 24px 0; text-align: center;">Funds Released Automatically ⏱️</h1>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
                        The buyer did not confirm receipt within the 7-day protection period.
                    </p>

                    <div style="background-color: #ECFDF5; border: 1px solid #6EE7B7; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                        <p style="color: #065F46; font-size: 18px; font-weight: 500; margin: 0 0 8px 0;">We have released your payout:</p>
                        <p style="font-size: 32px; font-weight: bold; color: #059669; margin: 0;">$${payoutFormatted}</p>
                        <p style="color: #065F46; font-size: 14px; margin: 8px 0 0 0;">for ${domainName}</p>
                    </div>
                    
                    <p style="color: #6B7280; font-size: 14px; text-align: center;">
                        Funds should appear in your Stripe account within 2-3 business days.
                    </p>
                 `;
                break;
        }

        return header + content + footer;
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-black p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold dark:text-white mb-6">Email Preview & Design System</h1>

                <div className="mb-8 flex flex-wrap gap-2 justify-center bg-white dark:bg-[#111] p-4 rounded-xl shadow-sm border border-gray-200 dark:border-white/10">
                    {[
                        { id: 'welcome', label: '1. Welcome' },
                        { id: 'reset_password', label: '2. Reset Password' },
                        { id: 'seller_sale', label: '3. Sale Notification (Seller)' },
                        { id: 'buyer_purchase', label: '4. Order Config (Buyer)' },
                        { id: 'auth_code', label: '5. Auth Code Ready (Buyer)' },
                        { id: 'payout', label: '6. Payout Sent (Seller)' },
                        { id: 'auto_release', label: '7. Auto Release (Seller)' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id as any)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${view === item.id
                                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-2xl">
                    <div className="bg-gray-50 dark:bg-[#151515] border-b border-gray-200 dark:border-white/10 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Previewing:</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                                {view.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>
                        <div className="flex gap-2 opacity-50">
                            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                        </div>
                    </div>
                    <div className="flex justify-center bg-gray-100 dark:bg-[#0a0a0a] p-8 h-[800px] overflow-y-auto">
                        <iframe
                            srcDoc={getHtml()}
                            className="w-[600px] h-full bg-white shadow-xl rounded-xl"
                            title="Email Preview"
                            style={{ border: 'none' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
