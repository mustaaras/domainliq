'use client';

import { useState, useCallback } from 'react';
import type { Domain } from './useDomains';
import { verifyDomain as verifyDomainAction } from '@/app/actions/verify-domain';

type VerificationStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseDomainVerificationOptions {
    onDomainVerified?: (domainId: string) => void;
}

export function useDomainVerification(options: UseDomainVerificationOptions = {}) {
    const { onDomainVerified } = options;

    const [showModal, setShowModal] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
    const [status, setStatus] = useState<VerificationStatus>('idle');
    const [message, setMessage] = useState('');
    const [activeMethod, setActiveMethod] = useState<'txt' | 'ns' | null>(null);
    const [copiedToken, setCopiedToken] = useState(false);
    const [isBulkVerifying, setIsBulkVerifying] = useState(false);

    const openModal = useCallback(async (domain: Domain, generateToken: boolean = true) => {
        setSelectedDomain(domain);
        setStatus('idle');
        setMessage('');
        setShowModal(true);

        // Generate token if missing
        if (generateToken && !domain.verificationToken) {
            try {
                const res = await fetch(`/api/user/domains/${domain.id}/verify-token`, {
                    method: 'POST'
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.token) {
                        setSelectedDomain(prev => prev ? { ...prev, verificationToken: data.token } : null);
                    }
                }
            } catch (error) {
                console.error('Failed to generate token:', error);
            }
        }
    }, []);

    const closeModal = useCallback(() => {
        setShowModal(false);
        setSelectedDomain(null);
        setStatus('idle');
        setMessage('');
        setActiveMethod(null);
    }, []);

    const verify = useCallback(async () => {
        if (!selectedDomain) return { success: false };

        setStatus('loading');
        setMessage('');

        try {
            const result = await verifyDomainAction(selectedDomain.id);

            if (result.success) {
                setStatus('success');
                setMessage('Domain verified successfully!');
                onDomainVerified?.(selectedDomain.id);

                setTimeout(() => {
                    closeModal();
                }, 2000);

                return { success: true };
            } else {
                setStatus('error');
                setMessage(result.error || 'Verification failed');
                return { success: false, error: result.error };
            }
        } catch (error: any) {
            setStatus('error');
            setMessage('An unexpected error occurred');
            return { success: false, error: error.message };
        }
    }, [selectedDomain, onDomainVerified, closeModal]);

    const bulkVerify = useCallback(async (domainIds: string[]) => {
        setIsBulkVerifying(true);
        const results: { id: string; success: boolean }[] = [];

        for (const id of domainIds) {
            try {
                const result = await verifyDomainAction(id);
                results.push({ id, success: !!result.success });
                if (result.success) {
                    onDomainVerified?.(id);
                }
            } catch {
                results.push({ id, success: false });
            }
        }

        setIsBulkVerifying(false);
        return results;
    }, [onDomainVerified]);

    const copyToClipboard = useCallback((text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2000);
    }, []);

    return {
        // State
        showModal,
        selectedDomain,
        status,
        message,
        activeMethod,
        copiedToken,
        isBulkVerifying,

        // Actions
        openModal,
        closeModal,
        verify,
        bulkVerify,
        setActiveMethod,
        copyToClipboard,
    };
}
