'use client';

import { useState } from 'react';
import { Loader2, Plus, DollarSign, CheckSquare, ShieldCheck, X } from 'lucide-react';
import type { Domain } from '@/hooks/useDomains';
import { PortfolioForm } from './PortfolioForm';

interface EditPortfolioModalProps {
    portfolio: {
        id: string;
        name: string;
        price: number | null;
        domains: { id: string }[];
    };
    domains: Domain[];
    isOpen: boolean;
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: (id: string, name: string, price: number | null, domainIds: Set<string>) => Promise<{ success: boolean; error?: string }>;
}

export function EditPortfolioModal({
    portfolio,
    domains,
    isOpen,
    isSubmitting,
    onClose,
    onSubmit,
}: EditPortfolioModalProps) {
    const [name, setName] = useState(portfolio.name);
    const [price, setPrice] = useState(portfolio.price ? portfolio.price.toString() : '');
    const [selectedDomainIds, setSelectedDomainIds] = useState<Set<string>>(new Set(portfolio.domains.map(d => d.id)));
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setError('');
        if (!name || selectedDomainIds.size === 0) {
            setError('Name and at least one domain are required');
            return { success: false, error: 'Validation failed' };
        }

        const result = await onSubmit(
            portfolio.id,
            name,
            price ? parseFloat(price) : null,
            selectedDomainIds
        );

        if (result.success) {
            onClose();
            return { success: true };
        } else {
            setError(result.error || 'Failed to update portfolio');
            return { success: false, error: result.error };
        }
    };

    const handleToggleDomain = (domainId: string) => {
        setSelectedDomainIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(domainId)) {
                newSet.delete(domainId);
            } else {
                newSet.add(domainId);
            }
            return newSet;
        });
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="dark:bg-[#0A0A0A] bg-white border dark:border-white/20 border-gray-300 rounded-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b dark:border-white/10 border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold dark:text-white text-gray-900">Edit Portfolio</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                        <X className="w-5 h-5 dark:text-gray-400 text-gray-500" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto">
                    <PortfolioForm
                        domains={domains}
                        name={name}
                        price={price}
                        selectedDomainIds={selectedDomainIds}
                        isSubmitting={isSubmitting}
                        error={error}
                        onNameChange={setName}
                        onPriceChange={setPrice}
                        onToggleDomain={handleToggleDomain}
                        onSelectionChange={setSelectedDomainIds}
                        onSubmit={handleSubmit}
                        submitLabel="Update"
                        submitIcon={null}
                    />
                </div>
            </div>
        </div>
    );
}
