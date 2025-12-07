'use client';

import { Loader2, X, ShieldCheck, Copy, Check, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Domain } from '@/hooks/useDomains';

interface VerifyDomainModalProps {
    isOpen: boolean;
    domain: Domain | null;
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
    activeMethod: 'txt' | 'ns' | 'a' | null;
    copiedToken: boolean;
    onClose: () => void;
    onVerify: () => void;
    onSetActiveMethod: (method: 'txt' | 'ns' | 'a' | null) => void;
    onCopyToken: (text: string) => void;
}

export function VerifyDomainModal({
    isOpen,
    domain,
    status,
    message,
    activeMethod,
    copiedToken,
    onClose,
    onVerify,
    onSetActiveMethod,
    onCopyToken,
}: VerifyDomainModalProps) {
    if (!isOpen || !domain) return null;

    const token = domain.verificationToken;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-[#0A0A0A] border dark:border-white/10 border-gray-200 rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <h3 className="text-lg font-semibold dark:text-white text-gray-900">Verify {domain.name}</h3>
                    </div>
                    <button onClick={onClose} className="dark:text-gray-400 text-gray-500 hover:text-gray-700 dark:hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Status Messages */}
                {status === 'success' && (
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-500">
                        <CheckCircle className="w-5 h-5" />
                        <span>{message}</span>
                    </div>
                )}

                {status === 'error' && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-500">
                        <AlertTriangle className="w-5 h-5" />
                        <span>{message}</span>
                    </div>
                )}

                {/* Method Selection */}
                <div className="mb-4">
                    <p className="text-sm dark:text-gray-400 text-gray-600 mb-3">
                        Choose a verification method:
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onSetActiveMethod('a')}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeMethod === 'a'
                                ? 'bg-amber-500 text-white'
                                : 'dark:bg-white/10 bg-gray-100 dark:text-gray-300 text-gray-600 dark:hover:bg-white/20 hover:bg-gray-200'
                                }`}
                        >
                            A Record
                        </button>
                        <button
                            onClick={() => onSetActiveMethod('txt')}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeMethod === 'txt'
                                ? 'bg-amber-500 text-white'
                                : 'dark:bg-white/10 bg-gray-100 dark:text-gray-300 text-gray-600 dark:hover:bg-white/20 hover:bg-gray-200'
                                }`}
                        >
                            TXT Record
                        </button>
                        <button
                            onClick={() => onSetActiveMethod('ns')}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeMethod === 'ns'
                                ? 'bg-amber-500 text-white'
                                : 'dark:bg-white/10 bg-gray-100 dark:text-gray-300 text-gray-600 dark:hover:bg-white/20 hover:bg-gray-200'
                                }`}
                        >
                            NS Records
                        </button>
                    </div>
                </div>

                {/* TXT Record Instructions */}
                {activeMethod === 'txt' && token && (
                    <div className="border dark:border-white/10 border-gray-200 rounded-lg p-4 mb-4">
                        <h4 className="font-medium dark:text-white text-gray-900 mb-2">TXT Record Verification</h4>
                        <ol className="text-sm dark:text-gray-400 text-gray-600 space-y-2 list-decimal list-inside mb-4">
                            <li>Go to your domain registrar's DNS settings</li>
                            <li>Add a new TXT record</li>
                            <li>Set the name/host to <code className="px-1 py-0.5 dark:bg-white/10 bg-gray-100 rounded">@</code> or <code className="px-1 py-0.5 dark:bg-white/10 bg-gray-100 rounded">_domainliq</code></li>
                            <li>Set the value to the token below</li>
                            <li>Wait a few minutes for DNS propagation</li>
                            <li>Click "Verify Now"</li>
                        </ol>

                        <div className="flex items-center gap-2 p-3 dark:bg-black/30 bg-gray-50 rounded-lg">
                            <code className="flex-1 text-xs font-mono dark:text-amber-400 text-amber-600 break-all">
                                domainliq-verify={token}
                            </code>
                            <button
                                onClick={() => onCopyToken(`domainliq-verify=${token}`)}
                                className="p-2 dark:bg-white/10 bg-gray-200 rounded-lg dark:hover:bg-white/20 hover:bg-gray-300 transition-colors shrink-0"
                            >
                                {copiedToken ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 dark:text-gray-400 text-gray-500" />}
                            </button>
                        </div>
                    </div>
                )}

                {/* NS Record Instructions */}
                {activeMethod === 'ns' && (
                    <div className="border dark:border-white/10 border-gray-200 rounded-lg p-4 mb-4">
                        <h4 className="font-medium dark:text-white text-gray-900 mb-2">NS Record Verification</h4>
                        <p className="text-sm dark:text-gray-400 text-gray-600 mb-3">
                            We will verify that the NS records of <strong>{domain.name}</strong> match the registrar's authoritative nameservers.
                        </p>
                        <p className="text-sm dark:text-gray-400 text-gray-600">
                            No action required if you own this domain. Just click "Verify Now".
                        </p>
                    </div>
                )}

                {/* A Record Instructions */}
                {activeMethod === 'a' && (
                    <div className="border dark:border-white/10 border-gray-200 rounded-lg p-4 mb-4">
                        <h4 className="font-medium dark:text-white text-gray-900 mb-2">A Record Verification (Recommended for SSL)</h4>
                        <ol className="text-sm dark:text-gray-400 text-gray-600 space-y-2 list-decimal list-inside mb-4">
                            <li>Go to your domain registrar's DNS settings</li>
                            <li>Add an <strong>A Record</strong></li>
                            <li>Set the host to <code className="px-1 py-0.5 dark:bg-white/10 bg-gray-100 rounded">@</code></li>
                            <li>Set the value to our Secure Proxy IP:</li>
                        </ol>

                        <div className="flex items-center gap-2 p-3 dark:bg-black/30 bg-gray-50 rounded-lg">
                            <code className="flex-1 text-sm font-mono dark:text-amber-400 text-amber-600">
                                128.140.116.30
                            </code>
                            <button
                                onClick={() => onCopyToken('128.140.116.30')}
                                className="p-2 dark:bg-white/10 bg-gray-200 rounded-lg dark:hover:bg-white/20 hover:bg-gray-300 transition-colors shrink-0"
                            >
                                {copiedToken ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 dark:text-gray-400 text-gray-500" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Note: This enables automatic SSL (HTTPS) for your custom domain.
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 dark:bg-white/10 bg-gray-100 dark:text-white text-gray-700 rounded-lg font-medium dark:hover:bg-white/20 hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onVerify}
                        disabled={status === 'loading' || status === 'success' || !activeMethod}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                    >
                        {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                        Verify Now
                    </button>
                </div>
            </div>
        </div>
    );
}
