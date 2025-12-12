'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DashboardHeader } from '@/components/dashboard-header';
import { Loader2, Copy, Check, ExternalLink, ArrowRight, ShieldCheck, Clock, CheckCircle, FileText, Printer } from 'lucide-react';
import Link from 'next/link';

interface Order {
    id: string;
    domain: { name: string };
    buyerEmail: string;
    amount: number;
    platformFee: number;
    status: string;
    createdAt: string;
    paidAt: string | null;
    transferredAt: string | null;
    completedAt: string | null;
    authCode?: string | null;
    stripePaymentIntentId?: string | null;
}

// Helper function to mask email for privacy
function maskEmail(email: string): string {
    if (!email) return 'Anonymous';
    const [local, domain] = email.split('@');
    if (!domain) return email.substring(0, 2) + '***';
    const maskedLocal = local.substring(0, 2) + '***';
    const domainParts = domain.split('.');
    const maskedDomain = domainParts[0].substring(0, 2) + '***.' + domainParts.slice(1).join('.');
    return `${maskedLocal}@${maskedDomain}`;
}

export default function OrdersPage() {
    const { data: session, status } = useSession();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Transfer Modal State
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [authCode, setAuthCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);

    // Receipt Modal State
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchOrders();
        }
    }, [status]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/user/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenTransfer = (order: Order) => {
        setSelectedOrder(order);
        setAuthCode('');
        setShowTransferModal(true);
    };

    const handleMarkTransferred = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/orders/${selectedOrder.id}/mark-transferred`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ authCode })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update order');
            }

            // Update local state
            setOrders(orders.map(o =>
                o.id === selectedOrder.id
                    ? { ...o, status: 'transferred', transferredAt: new Date().toISOString(), authCode }
                    : o
            ));

            setShowTransferModal(false);
            alert('Order marked as transferred! Buyer has been notified.');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'paid': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'transferred': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Pending Payment';
            case 'paid': return 'Action Required';
            case 'transferred': return 'Pending Confirmation';
            case 'completed': return 'Sold & Paid';
            default: return status;
        }
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen dark:bg-[#050505] bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 dark:text-amber-500 text-amber-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen dark:bg-[#050505] bg-gray-50 dark:text-white text-gray-900 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <DashboardHeader />

                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">My Orders</h2>
                    <p className="text-gray-500 dark:text-gray-400">Manage your sales and domain transfers.</p>
                </div>

                <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                    {orders.length === 0 ? (
                        <div className="p-12 text-center">
                            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                            <p className="text-gray-500">When you sell a domain, it will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">{order.domain.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{maskEmail(order.buyerEmail)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-green-600 dark:text-green-400">
                                                ${(order.amount / 100).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex justify-end">
                                                    {order.status === 'paid' && (
                                                        <button
                                                            onClick={() => handleOpenTransfer(order)}
                                                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1"
                                                        >
                                                            Transfer Now <ArrowRight className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                    {order.status === 'transferred' && (
                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Clock className="h-3 w-3" /> Waiting for Buyer
                                                        </span>
                                                    )}
                                                    {order.status === 'completed' && (
                                                        <span className="text-xs text-green-500 flex items-center gap-1">
                                                            <CheckCircle className="h-3 w-3" /> Paid Out
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {(order.status === 'completed' || order.status === 'transferred') && (
                                                    <button
                                                        onClick={() => {
                                                            setReceiptOrder(order);
                                                            setShowReceiptModal(true);
                                                        }}
                                                        className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors inline-flex items-center gap-1"
                                                    >
                                                        <FileText className="h-3 w-3" /> View
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Transfer Modal */}
            {showTransferModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#111] rounded-2xl shadow-xl border dark:border-white/10 max-w-lg w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Transfer Domain</h3>

                        <div className="mb-6 space-y-4 text-sm text-gray-600 dark:text-gray-300">
                            <p>You received a payment for <strong>{selectedOrder.domain.name}</strong>.</p>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
                                <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">Instructions:</p>
                                <ol className="list-decimal pl-4 space-y-1">
                                    <li>Log into your registrar (e.g. GoDaddy, Namecheap).</li>
                                    <li>Unlock the domain <strong>{selectedOrder.domain.name}</strong>.</li>
                                    <li>Get the <strong>Authorization Code (EPP Code)</strong>.</li>
                                    <li>Enter the code below and click "Confirm Transfer".</li>
                                </ol>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Authorization Code (Optional)</label>
                                <input
                                    type="text"
                                    value={authCode}
                                    onChange={(e) => setAuthCode(e.target.value)}
                                    placeholder="Enter EPP / Auth Code here..."
                                    className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    If you enter the code here, we will email it safely to the buyer. This is the fastest way to transfer.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowTransferModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMarkTransferred}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                Confirm Transfer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            {showReceiptModal && receiptOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#111] rounded-2xl shadow-xl border dark:border-white/10 max-w-lg w-full">
                        {/* Printable Content */}
                        <div id="receipt-content" className="p-6 print:p-8">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b dark:border-white/10 pb-4 mb-4">
                                <div>
                                    <h3 className="text-xl font-bold">Sales Receipt</h3>
                                    <p className="text-xs text-gray-500">DomainLiq</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Receipt ID</p>
                                    <p className="text-xs font-mono">{receiptOrder.id.slice(0, 12)}...</p>
                                </div>
                            </div>

                            {/* Domain Info */}
                            <div className="mb-6">
                                <p className="text-sm text-gray-500 mb-1">Domain Sold</p>
                                <p className="text-lg font-bold">{receiptOrder.domain.name}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Date: {new Date(receiptOrder.completedAt || receiptOrder.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Financial Breakdown */}
                            <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4 mb-6 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Sale Price</span>
                                    <span className="font-medium">${(receiptOrder.amount / 100).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Stripe Processing Fee (~2.9% + $0.30)</span>
                                    <span className="text-red-500">-${((receiptOrder.amount / 100) * 0.029 + 0.30).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">DomainLiq Platform Fee</span>
                                    <span className="text-red-500">-${(receiptOrder.platformFee / 100).toFixed(2)}</span>
                                </div>
                                <div className="border-t dark:border-white/10 pt-3 flex justify-between font-bold">
                                    <span>Net Payout</span>
                                    <span className="text-green-600 dark:text-green-400">
                                        ${((receiptOrder.amount - receiptOrder.platformFee) / 100 - ((receiptOrder.amount / 100) * 0.029 + 0.30)).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Buyer Info */}
                            <div className="text-sm mb-4">
                                <p className="text-gray-500 mb-1">Buyer</p>
                                <p className="font-medium">{maskEmail(receiptOrder.buyerEmail)}</p>
                            </div>

                            {/* Payment Reference */}
                            {receiptOrder.stripePaymentIntentId && (
                                <div className="text-xs text-gray-500 border-t dark:border-white/10 pt-4">
                                    <p>Payment Reference: <span className="font-mono">{receiptOrder.stripePaymentIntentId}</span></p>
                                </div>
                            )}
                        </div>

                        {/* Modal Actions (hidden in print) */}
                        <div className="flex gap-3 justify-end p-4 border-t dark:border-white/10 print:hidden">
                            <button
                                onClick={() => setShowReceiptModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 text-white rounded-lg flex items-center gap-2"
                            >
                                <Printer className="h-4 w-4" />
                                Print / Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
