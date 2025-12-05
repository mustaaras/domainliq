'use client';

import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';

interface BulkUploadFormProps {
    onSubmit: (domains: Array<{ name: string; price: number }>) => Promise<{ success: boolean; error?: string }>;
    isSubmitting: boolean;
}

export function BulkUploadForm({ onSubmit, isSubmitting }: BulkUploadFormProps) {
    const [bulkText, setBulkText] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const lines = bulkText.trim().split('\n').filter(line => line.trim());

            if (lines.length === 0) {
                throw new Error('Please enter at least one domain');
            }
            if (lines.length > 500) {
                throw new Error('Maximum 500 domains per bulk upload');
            }

            const domainsToAdd = [];
            for (let i = 0; i < lines.length; i++) {
                const parts = lines[i].trim().split(/\s+/);
                if (parts.length !== 2) {
                    throw new Error(`Line ${i + 1}: Invalid format. Use "domain.com price"`);
                }
                const [name, priceStr] = parts;
                const price = parseFloat(priceStr);
                if (isNaN(price) || price <= 0) {
                    throw new Error(`Line ${i + 1}: Invalid price "${priceStr}"`);
                }
                domainsToAdd.push({ name, price });
            }

            const result = await onSubmit(domainsToAdd);

            if (result.success) {
                setBulkText('');
                alert('Domains added successfully!');
            } else {
                setError(result.error || 'Failed to add domains');
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Domains (max 500)
                </label>
                <textarea
                    value={bulkText}
                    onChange={e => setBulkText(e.target.value)}
                    placeholder={`example.com 100
another.io 50
domain.xyz 10`}
                    rows={8}
                    className="w-full dark:bg-black/20 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg px-4 py-2 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono text-sm"
                    required
                />
                <p className="text-xs dark:text-gray-500 text-gray-400 mt-1">
                    One domain per line: domain.com price
                </p>
            </div>

            {error && (
                <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add All Domains
            </button>
        </form>
    );
}
