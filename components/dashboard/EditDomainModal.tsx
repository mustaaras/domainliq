'use client';

import { useState } from 'react';
import { Loader2, X, DollarSign, Link as LinkIcon } from 'lucide-react';
import type { Domain } from '@/hooks/useDomains';

interface EditDomainModalProps {
    domain: Domain;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updates: { price?: number; checkoutLink?: string }) => Promise<{ success: boolean; error?: string }>;
}

export function EditDomainModal({ domain, isOpen, onClose, onSave }: EditDomainModalProps) {
    const [price, setPrice] = useState(domain.price.toString());
    const [checkoutLink, setCheckoutLink] = useState(domain.checkoutLink || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const updates: { price?: number; checkoutLink?: string } = {};
        if (price) updates.price = parseFloat(price);
        if (checkoutLink !== domain.checkoutLink) updates.checkoutLink = checkoutLink;

        const result = await onSave(updates);

        if (result.success) {
            onClose();
        } else {
            setError(result.error || 'Failed to update domain');
        }

        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-[#0A0A0A] border dark:border-white/10 border-gray-200 rounded-xl p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold dark:text-white text-gray-900">Edit {domain.name}</h3>
                    <button onClick={onClose} className="dark:text-gray-400 text-gray-500 hover:text-gray-700 dark:hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                                className="w-full dark:bg-black/20 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg pl-9 pr-4 py-2 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                min="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                            Checkout Link (optional)
                        </label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 dark:text-gray-500 text-gray-400" />
                            <input
                                type="url"
                                value={checkoutLink}
                                onChange={e => setCheckoutLink(e.target.value)}
                                placeholder="https://..."
                                className="w-full dark:bg-black/20 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg pl-9 pr-4 py-2 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            />
                        </div>
                        <p className="text-xs dark:text-gray-500 text-gray-400 mt-1">
                            Add a direct checkout link (e.g., Dan.com, Sedo)
                        </p>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 dark:bg-white/10 bg-gray-100 dark:text-white text-gray-700 rounded-lg font-medium dark:hover:bg-white/20 hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
