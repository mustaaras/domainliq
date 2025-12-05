'use client';

import { useState } from 'react';
import { Loader2, Plus, DollarSign } from 'lucide-react';

interface AddDomainFormProps {
    onSubmit: (name: string, price: number) => Promise<{ success: boolean; error?: string }>;
    isSubmitting: boolean;
}

export function AddDomainForm({ onSubmit, isSubmitting }: AddDomainFormProps) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || !price) {
            setError('Both fields are required');
            return;
        }

        const result = await onSubmit(name.trim(), parseFloat(price));

        if (result.success) {
            setName('');
            setPrice('');
        } else {
            setError(result.error || 'Failed to add domain');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Domain Name
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="example.com"
                    className="w-full dark:bg-black/20 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg px-4 py-2 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Price ($)
                </label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 dark:text-gray-500 text-gray-400" />
                    <input
                        type="number"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder="50"
                        className="w-full dark:bg-black/20 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg pl-9 pr-4 py-2 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        required
                        min="0"
                    />
                </div>
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
                Add Domain
            </button>
        </form>
    );
}
