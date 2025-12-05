'use client';

import { useState, useCallback } from 'react';
import type { Domain } from './useDomains';

export interface Portfolio {
    id: string;
    name: string;
    price: number | null;
    domains: Domain[];
    createdAt: string;
}

interface UsePortfoliosOptions {
    onError?: (message: string) => void;
}

export function usePortfolios(options: UsePortfoliosOptions = {}) {
    const { onError } = options;

    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Form state for new portfolio
    const [newPortfolio, setNewPortfolio] = useState({
        name: '',
        price: '',
        domainIds: new Set<string>()
    });

    const fetchPortfolios = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/user/portfolios');
            if (res.ok) {
                const data = await res.json();
                setPortfolios(data);
            }
        } catch (error: any) {
            onError?.('Failed to fetch portfolios');
        } finally {
            setIsLoading(false);
        }
    }, [onError]);

    const createPortfolio = useCallback(async () => {
        if (!newPortfolio.name || newPortfolio.domainIds.size === 0) {
            return { success: false, error: 'Name and at least one domain are required' };
        }

        setIsCreating(true);
        try {
            const res = await fetch('/api/user/portfolios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newPortfolio.name,
                    price: newPortfolio.price ? parseFloat(newPortfolio.price) : null,
                    domainIds: Array.from(newPortfolio.domainIds)
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create portfolio');
            }

            await fetchPortfolios();
            resetForm();
            return { success: true };
        } catch (error: any) {
            onError?.(error.message);
            return { success: false, error: error.message };
        } finally {
            setIsCreating(false);
        }
    }, [newPortfolio, fetchPortfolios, onError]);

    const deletePortfolio = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/user/portfolios/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setPortfolios(prev => prev.filter(p => p.id !== id));
                return { success: true };
            } else {
                throw new Error('Failed to delete portfolio');
            }
        } catch (error: any) {
            onError?.(error.message);
            return { success: false, error: error.message };
        }
    }, [onError]);

    const toggleDomainSelection = useCallback((domainId: string) => {
        setNewPortfolio(prev => {
            const newSet = new Set(prev.domainIds);
            if (newSet.has(domainId)) {
                newSet.delete(domainId);
            } else {
                newSet.add(domainId);
            }
            return { ...prev, domainIds: newSet };
        });
    }, []);

    const updateFormField = useCallback((field: 'name' | 'price', value: string) => {
        setNewPortfolio(prev => ({ ...prev, [field]: value }));
    }, []);

    const resetForm = useCallback(() => {
        setNewPortfolio({ name: '', price: '', domainIds: new Set() });
    }, []);

    return {
        // State
        portfolios,
        isLoading,
        isCreating,
        newPortfolio,

        // Actions
        fetchPortfolios,
        createPortfolio,
        deletePortfolio,
        toggleDomainSelection,
        updateFormField,
        resetForm,
    };
}
