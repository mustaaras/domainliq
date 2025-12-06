'use client';

import { useState } from 'react';
import { Search, Globe, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { lookupWhois } from '@/app/actions/whois';

export function WhoisLookup() {
    const [domain, setDomain] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!domain.trim()) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await lookupWhois(domain.trim());
            if (res.error) {
                setError(res.error);
            } else {
                setResult(res.data);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to format WHOIS data nicely
    const formatValue = (key: string, value: any) => {
        if (!value) return null;
        if (typeof value === 'object') return JSON.stringify(value);
        return value.toString();
    };

    // Common important keys to show first
    const priorityKeys = ['domainName', 'registrar', 'creationDate', 'updatedDate', 'expirationDate', 'registrantName', 'registrantOrganization'];

    return (
        <div className="dark:bg-[#0A0A0A] bg-white border dark:border-white/10 border-gray-200 rounded-xl p-6 shadow-sm mt-8">
            <div className="flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl font-bold dark:text-white text-gray-900">WHOIS Lookup</h2>
            </div>

            <form onSubmit={handleLookup} className="relative mb-6">
                <div className="relative">
                    <input
                        type="text"
                        value={domain}
                        onChange={(e) => {
                            // Frontend Input Sanitization
                            // Deny: spaces, ;, |, &, $, `, <, >, \
                            const val = e.target.value;
                            if (/[; |&`$<>\\]/.test(val)) return;
                            setDomain(val);
                        }}
                        placeholder="Enter domain name (e.g., domainliq.com)"
                        className="w-full pl-10 pr-28 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none text-gray-900 dark:text-white transition-all"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !domain.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            {result && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium mb-4">
                        <CheckCircle className="h-4 w-4" />
                        WHOIS Data Found
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {/* Priority Fields */}
                        {priorityKeys.map(key => {
                            if (!result[key]) return null;
                            return (
                                <div key={key} className="grid grid-cols-3 gap-2 text-sm border-b border-gray-100 dark:border-white/5 pb-2 last:border-0">
                                    <span className="font-medium text-gray-500 dark:text-gray-400 capitalize whitespace-nowrap overflow-hidden text-ellipsis" title={key.replace(/([A-Z])/g, ' $1').trim()}>
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <span className="col-span-2 text-gray-900 dark:text-white break-all font-mono text-xs">
                                        {formatValue(key, result[key])}
                                    </span>
                                </div>
                            );
                        })}

                        {/* Other Fields (Hidden by default or shown below? For now, showing all filtered) */}
                        {Object.keys(result).filter(k => !priorityKeys.includes(k)).map(key => {
                            if (!result[key] || typeof result[key] === 'object') return null; // Skip complex objects for simplicity
                            return (
                                <div key={key} className="grid grid-cols-3 gap-2 text-sm border-b border-gray-100 dark:border-white/5 pb-2 last:border-0">
                                    <span className="font-medium text-gray-500 dark:text-gray-400 capitalize whitespace-nowrap overflow-hidden text-ellipsis" title={key}>
                                        {key}
                                    </span>
                                    <span className="col-span-2 text-gray-900 dark:text-white break-all font-mono text-xs">
                                        {formatValue(key, result[key])}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
