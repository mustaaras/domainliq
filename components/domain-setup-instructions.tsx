'use client';

import { useState } from 'react';
import { Copy, Check, AlertTriangle, ExternalLink, Globe } from 'lucide-react';

interface DomainSetupInstructionsProps {
    domainName: string;
    onVerify: () => void;
    isVerifying: boolean;
}

export function DomainSetupInstructions({ domainName, onVerify, isVerifying }: DomainSetupInstructionsProps) {
    const [copied, setCopied] = useState<string | null>(null);

    const serverIp = '46.224.108.38';

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-[#111] border dark:border-white/10 rounded-xl overflow-hidden">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-none p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                            <Globe className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="space-y-4 flex-1">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Connect via Cloudflare (Recommended for SSL)
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    We recommend using Cloudflare as your DNS provider to get <strong>free automatic SSL</strong> and DDoS protection.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-bold text-gray-600 dark:text-gray-400">1</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <p>Add your domain <strong>{domainName}</strong> to Cloudflare (Free Plan).</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-bold text-gray-600 dark:text-gray-400">2</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <p>Add an <strong>A Record</strong> pointing to our server IP:</p>
                                        <div className="mt-2 flex items-center gap-2 bg-gray-50 dark:bg-black/20 border dark:border-white/10 rounded-lg p-2 font-mono text-xs">
                                            <span className="text-gray-500">{serverIp}</span>
                                            <button
                                                onClick={() => copyToClipboard(serverIp)}
                                                className="ml-auto p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md transition-colors"
                                                title="Copy IP"
                                            >
                                                {copied === serverIp ? (
                                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                                ) : (
                                                    <Copy className="h-3.5 w-3.5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-bold text-gray-600 dark:text-gray-400">3</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <p><strong>Important:</strong> Make sure the "Proxy status" is set to <strong>Proxied</strong> (Orange Cloud icon).</p>
                                        <p className="mt-1 text-xs text-gray-500">This enables free SSL/HTTPS for your domain automatically.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={onVerify}
                        disabled={isVerifying}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isVerifying ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Verifying...
                            </>
                        ) : (
                            'Verify Connection'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
