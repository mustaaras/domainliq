'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Domain } from './useDomains';

type VerificationFilter = 'all' | 'verified' | 'unverified';
type SortBy = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';

export function useFilters(domains: Domain[]) {
    const [selectedTLDs, setSelectedTLDs] = useState<Set<string>>(new Set());
    const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>('all');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [sortBy, setSortBy] = useState<SortBy>('newest');

    const toggleTLD = useCallback((tld: string) => {
        setSelectedTLDs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tld)) {
                newSet.delete(tld);
            } else {
                newSet.add(tld);
            }
            return newSet;
        });
    }, []);

    const clearFilters = useCallback(() => {
        setSelectedTLDs(new Set());
        setVerificationFilter('all');
        setPriceMin('');
        setPriceMax('');
        setSortBy('newest');
    }, []);

    const activeFiltersCount = useMemo(() => {
        return selectedTLDs.size +
            (verificationFilter !== 'all' ? 1 : 0) +
            (priceMin || priceMax ? 1 : 0) +
            (sortBy !== 'newest' ? 1 : 0);
    }, [selectedTLDs.size, verificationFilter, priceMin, priceMax, sortBy]);

    const filteredDomains = useMemo(() => {
        let result = [...domains];

        // Filter by TLD
        if (selectedTLDs.size > 0) {
            result = result.filter(d => {
                const tld = d.name.split('.').pop()?.toLowerCase() || '';
                return selectedTLDs.has(tld);
            });
        }

        // Filter by verification
        if (verificationFilter === 'verified') {
            result = result.filter(d => d.isVerified);
        } else if (verificationFilter === 'unverified') {
            result = result.filter(d => !d.isVerified);
        }

        // Filter by price
        if (priceMin) {
            result = result.filter(d => d.price >= parseFloat(priceMin));
        }
        if (priceMax) {
            result = result.filter(d => d.price <= parseFloat(priceMax));
        }

        // Sort
        switch (sortBy) {
            case 'oldest':
                result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'price_asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'name_asc':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name_desc':
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
        }

        return result;
    }, [domains, selectedTLDs, verificationFilter, priceMin, priceMax, sortBy]);

    // Extract unique TLDs from domains
    const availableTLDs = useMemo(() => {
        const tlds = new Set<string>();
        domains.forEach(d => {
            const tld = d.name.split('.').pop()?.toLowerCase();
            if (tld) tlds.add(tld);
        });
        return Array.from(tlds).sort();
    }, [domains]);

    return {
        // State
        selectedTLDs,
        verificationFilter,
        priceMin,
        priceMax,
        sortBy,
        activeFiltersCount,
        availableTLDs,

        // Computed
        filteredDomains,

        // Actions
        toggleTLD,
        setVerificationFilter,
        setPriceMin,
        setPriceMax,
        setSortBy,
        clearFilters,
    };
}
