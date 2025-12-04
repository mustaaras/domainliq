'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink, AlertTriangle, Info, ShieldCheck } from 'lucide-react';

interface DomainSetupInstructionsProps {
    domainName: string;
    onVerify: () => void;
    isVerifying: boolean;
    activeTab: 'redirect' | 'arecord';
    onTabChange: (tab: 'redirect' | 'arecord') => void;
}

export function DomainSetupInstructions({ domainName, onVerify, isVerifying, activeTab, onTabChange }: DomainSetupInstructionsProps) {
    const [copied, setCopied] = useState(false);

    const targetUrl = `https://domainliq.com/d/${domainName}`;
    const serverIp = '46.224.108.38';

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-lg overflow-x-auto">
                <button
                    onClick={() => onTabChange('redirect')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'redirect'
                        ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                >
                    Option 1: Redirect
                </button>
                <button
                    onClick={() => onTabChange('arecord')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'arecord'
                        ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                >
                    Option 2: A Record
                </button>
            </div>

            {activeTab === 'redirect' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-full">
                                <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="font-medium text-indigo-900 dark:text-indigo-200">Why choose Redirect?</h4>
                                <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                                    This is the easiest and most reliable method. It guarantees working SSL (HTTPS) and sets up instantly.
                                    Users will be redirected to your secure DomainLiq page.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium dark:text-white">Setup Instructions</h3>
                        <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-gray-300">
                            <li>Log in to your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare).</li>
                            <li>Find the <strong>Forwarding</strong> or <strong>Redirect</strong> settings.</li>
                            <li>Add a <strong>301 Permanent Redirect</strong> for <strong>{domainName}</strong> to:</li>
                        </ol>

                        <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg font-mono text-sm">
                            <span className="flex-1 truncate">{targetUrl}</span>
                            <button
                                onClick={() => copyToClipboard(targetUrl)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md transition-colors"
                                title="Copy URL"
                            >
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'arecord' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-full">
                                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h4 className="font-medium text-amber-900 dark:text-amber-200">SSL Warning</h4>
                                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                    This method keeps your domain in the address bar, but <strong>SSL (HTTPS) might fail</strong> unless you use Cloudflare nameservers.
                                    We recommend Option 1 for best reliability.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium dark:text-white">Setup Instructions</h3>
                        <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-gray-300">
                            <li>Log in to your domain registrar.</li>
                            <li>Go to <strong>DNS Management</strong>.</li>
                            <li>Add an <strong>A Record</strong> with the following details:</li>
                        </ol>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border dark:border-white/10">
                                <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Type</span>
                                <span className="font-mono font-medium">A</span>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border dark:border-white/10">
                                <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Name / Host</span>
                                <span className="font-mono font-medium">@</span>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg border dark:border-white/10 relative group">
                                <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Value / IP</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-medium">{serverIp}</span>
                                    <button
                                        onClick={() => copyToClipboard(serverIp)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Copy className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="pt-4 border-t dark:border-white/10">
                <button
                    onClick={onVerify}
                    disabled={isVerifying}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isVerifying ? (
                        <>
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        <>
                            Verify Setup
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
