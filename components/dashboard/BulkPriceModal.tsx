'use client';

import { useState } from 'react';
import { Loader2, X, DollarSign } from 'lucide-react';

interface BulkPriceModalProps {
    isOpen: boolean;
    selectedCount: number;
    onClose: () => void;
    onSave: (price: number) => Promise<{ success: boolean; error?: string }>;
}

export function BulkPriceModal({ isOpen, selectedCount, onClose, onSave }: BulkPriceModalProps) {
    const [price, setPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!price || parseFloat(price) <= 0) {
            setError('Please enter a valid price');
            return;
        }

        setIsSubmitting(true);
        setError('');

        const result = await onSave(parseFloat(price));

        if (result.success) {
            setPrice('');
            onClose();
            alert('Prices updated successfully!');
        } else {
            setError(result.error || 'Failed to update prices');
        }

        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-[#0A0A0A] border dark:border-white/10 border-gray-200 rounded-xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold dark:text-white text-gray-900">Update Price</h3>
                    <button onClick={onClose} className="dark:text-gray-400 text-gray-500 hover:text-gray-700 dark:hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-sm dark:text-gray-400 text-gray-600 mb-4">
                    Set a new price for {selectedCount} selected domain{selectedCount !== 1 ? 's' : ''}.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                            New Price ($)
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 dark:text-gray-500 text-gray-400" />
                            <input
                                type="number"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                placeholder="1000"
                                className="w-full dark:bg-black/20 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg pl-9 pr-4 py-2 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                min="0"
                                required
                            />
                        </div>
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
                            Update All
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
