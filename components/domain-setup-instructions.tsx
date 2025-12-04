'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink, AlertTriangle, Info, ShieldCheck } from 'lucide-react';

interface DomainSetupInstructionsProps {
    domainName: string;
    onVerify: () => void;
    isVerifying: boolean;
}

export function DomainSetupInstructions({ domainName, onVerify, isVerifying }: DomainSetupInstructionsProps) {
    const [copied, setCopied] = useState(false);

    const serverIp = '46.224.108.38';

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-full">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h4 className="font-medium text-amber-900 dark:text-amber-200">Custom Domain (A Record)</h4>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                This method keeps your domain in the address bar.
                                <strong>Note:</strong> SSL (HTTPS) is handled by us but may take time to provision. DNS propagation can take up to 48 hours.
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
