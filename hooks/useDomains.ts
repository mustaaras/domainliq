'use client';

import { useState, useCallback } from 'react';

export interface Domain {
    id: string;
    name: string;
    price: number;
    status: string;
    createdAt: string;
    isVerified: boolean;
    verificationToken: string | null;
    expiresAt: string | null;
    checkoutLink: string | null;
}

interface UseDomainOptions {
    onError?: (message: string) => void;
}

export function useDomains(options: UseDomainOptions = {}) {
    const { onError } = options;

    const [domains, setDomains] = useState<Domain[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Fetch all domains
    const fetchDomains = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/user/domains');
            if (!res.ok) throw new Error('Failed to fetch domains');
            const data = await res.json();
            setDomains(data);
        } catch (error: any) {
            onError?.(error.message);
        } finally {
            setIsLoading(false);
        }
    }, [onError]);

    // Add a single domain
    const addDomain = useCallback(async (name: string, price: number) => {
        setIsAdding(true);
        try {
            const res = await fetch('/api/user/domains', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, price })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to add domain');
            }

            const addedDomain = await res.json();
            setDomains(prev => [addedDomain, ...prev]);
            return { success: true, domain: addedDomain };
        } catch (error: any) {
            onError?.(error.message);
            return { success: false, error: error.message };
        } finally {
            setIsAdding(false);
        }
    }, [onError]);

    // Bulk add domains
    const bulkAddDomains = useCallback(async (domainsToAdd: Array<{ name: string; price: number }>) => {
        setIsAdding(true);
        try {
            const res = await fetch('/api/user/domains', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(domainsToAdd)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to add domains');
            }

            await fetchDomains(); // Refresh list
            return { success: true };
        } catch (error: any) {
            onError?.(error.message);
            return { success: false, error: error.message };
        } finally {
            setIsAdding(false);
        }
    }, [fetchDomains, onError]);

    // Update domain
    const updateDomain = useCallback(async (id: string, updates: Partial<Pick<Domain, 'price' | 'status' | 'checkoutLink'>>) => {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/user/domains/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update domain');
            }

            const updated = await res.json();
            setDomains(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
            return { success: true, domain: updated };
        } catch (error: any) {
            onError?.(error.message);
            return { success: false, error: error.message };
        } finally {
            setIsUpdating(false);
        }
    }, [onError]);

    // Delete domain
    const deleteDomain = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/user/domains/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete domain');
            }

            setDomains(prev => prev.filter(d => d.id !== id));
            setSelectedIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
            return { success: true };
        } catch (error: any) {
            onError?.(error.message);
            return { success: false, error: error.message };
        }
    }, [onError]);

    // Bulk delete
    const bulkDelete = useCallback(async () => {
        if (selectedIds.size === 0) return { success: false, error: 'No domains selected' };

        setIsDeleting(true);
        try {
            const deletePromises = Array.from(selectedIds).map(id =>
                fetch(`/api/user/domains/${id}`, { method: 'DELETE' })
            );
            await Promise.all(deletePromises);

            setDomains(prev => prev.filter(d => !selectedIds.has(d.id)));
            setSelectedIds(new Set());
            setIsSelectionMode(false);
            return { success: true };
        } catch (error: any) {
            onError?.('Failed to delete some domains');
            return { success: false, error: error.message };
        } finally {
            setIsDeleting(false);
        }
    }, [selectedIds, onError]);

    // Bulk update price
    const bulkUpdatePrice = useCallback(async (price: number) => {
        if (selectedIds.size === 0) return { success: false, error: 'No domains selected' };

        setIsUpdating(true);
        try {
            const updatePromises = Array.from(selectedIds).map(id =>
                fetch(`/api/user/domains/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ price })
                })
            );
            await Promise.all(updatePromises);

            setDomains(prev => prev.map(d =>
                selectedIds.has(d.id) ? { ...d, price } : d
            ));
            setSelectedIds(new Set());
            setIsSelectionMode(false);
            return { success: true };
        } catch (error: any) {
            onError?.('Failed to update prices');
            return { success: false, error: error.message };
        } finally {
            setIsUpdating(false);
        }
    }, [selectedIds, onError]);

    // Toggle sold status
    const toggleSold = useCallback(async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'sold' ? 'available' : 'sold';
        return updateDomain(id, { status: newStatus });
    }, [updateDomain]);

    // Selection helpers
    const toggleSelect = useCallback((id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const selectAll = useCallback((domainIds: string[]) => {
        setSelectedIds(new Set(domainIds));
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
        setIsSelectionMode(false);
    }, []);

    // Update domain in local state (for verification updates)
    const updateDomainLocally = useCallback((id: string, updates: Partial<Domain>) => {
        setDomains(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    }, []);

    return {
        // State
        domains,
        isLoading,
        isAdding,
        isDeleting,
        isUpdating,
        selectedIds,
        isSelectionMode,

        // Actions
        fetchDomains,
        addDomain,
        bulkAddDomains,
        updateDomain,
        deleteDomain,
        bulkDelete,
        bulkUpdatePrice,
        toggleSold,
        updateDomainLocally,

        // Selection
        toggleSelect,
        selectAll,
        clearSelection,
        setIsSelectionMode,
    };
}
