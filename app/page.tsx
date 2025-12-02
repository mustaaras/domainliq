'use client';

import { useState, useEffect } from 'react';
import { Share2, MessageCircle, Check, Search, Loader2, ShieldCheck, Filter, X, ChevronDown, Trophy, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Logo } from '@/components/logo';
import { ArrowRight, TrendingUp, Shield, Zap, Globe, DollarSign, CheckCircle } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface Domain {
  id: string;
  name: string;
  price: number;
  status: string;
  user: {
    subdomain: string;
    name: string | null;
    email: string | null; // Added for fallback
    contactEmail: string | null;
    twitterHandle: string | null;
    whatsappNumber: string | null;
    linkedinProfile: string | null;
    telegramUsername: string | null;
    preferredContact: string;
    escrowEmail: string | null;
  };
  isVerified?: boolean;
  expiresAt?: string | null;
}

interface TopSeller {
  id: string;
  name: string;
  subdomain: string;
  domainCount: number;
}

export default function Home() {
  const { data: session } = useSession();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalDomains, setTotalDomains] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showEscrowModal, setShowEscrowModal] = useState(false);
  const [selectedEscrowDomain, setSelectedEscrowDomain] = useState<Domain | null>(null);

  // Filter State
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterTLD, setFilterTLD] = useState<string[]>([]);
  const [filterPrice, setFilterPrice] = useState({ min: '', max: '' });
  const [filterVerified, setFilterVerified] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const commonTLDs = ['com', 'net', 'org', 'io', 'ai', 'xyz', 'co', 'app'];

  const fetchDomains = async (pageNum: number, limit: number) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
        search: searchQuery,
        sort: sortBy,
        ...(filterTLD.length && { tld: filterTLD.join(',') }),
        ...(filterPrice.min && { minPrice: filterPrice.min }),
        maxPrice: filterPrice.max ? Math.min(parseInt(filterPrice.max), 1000).toString() : '1000',
        ...(filterVerified && { verified: 'true' }),
      });
      const res = await fetch(`/api/domains?${params}`);
      const data = await res.json();

      if (data.error) {
        console.error('API Error:', data.error);
        return;
      }

      setDomains(data.domains);
      if (data.pagination) {
        setHasMore(data.pagination.page < data.pagination.pages);
        setTotalDomains(data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch domains:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const fetchTopSellers = async () => {
    try {
      const res = await fetch('/api/sellers/top');
      if (res.ok) {
        const data = await res.json();
        setTopSellers(data);
      }
    } catch (error) {
      console.error('Failed to fetch top sellers:', error);
    }
  };

  useEffect(() => {
    fetchTopSellers();
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      setPage(1);
      fetchDomains(1, itemsPerPage);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, itemsPerPage, sortBy, filterVerified, filterTLD, filterPrice]); // Re-fetch when filters change (debounced)

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchDomains(newPage, itemsPerPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value);
    setItemsPerPage(newLimit);
    setPage(1);
    // Effect will trigger fetch
  };

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
      return;
    }

    // Check if new domain belongs to the same seller as existing selections
    const domainToAdd = domains.find(d => d.id === id);
    if (!domainToAdd) return;

    if (selectedIds.length > 0) {
      const firstSelectedId = selectedIds[0];
      const firstSelectedDomain = domains.find(d => d.id === firstSelectedId);

      if (firstSelectedDomain && firstSelectedDomain.user.subdomain !== domainToAdd.user.subdomain) {
        alert("You can only select domains from the same seller at once.");
        return;
      }
    }

    setSelectedIds([...selectedIds, id]);
  };

  const handleShare = () => {
    const url = `https://twitter.com/intent/tweet?text=Check out these domains for sale!&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const handleContact = () => {
    const selected = domains.filter(d => selectedIds.includes(d.id));
    if (selected.length === 0) return;

    const seller = selected[0].user;

    // Get available contact methods
    const availableMethods = [
      seller.contactEmail && { type: 'email', label: 'Email', icon: '📧' },
      seller.twitterHandle && { type: 'twitter', label: 'Twitter/X', icon: '𝕏' },
      seller.whatsappNumber && { type: 'whatsapp', label: 'WhatsApp', icon: '💬' },
      seller.linkedinProfile && { type: 'linkedin', label: 'LinkedIn', icon: '💼' },
      seller.telegramUsername && { type: 'telegram', label: 'Telegram', icon: '✈️' },
    ].filter(Boolean) as { type: string; label: string; icon: string }[];

    // If multiple contact methods available, show modal to choose
    if (availableMethods.length > 1) {
      setShowContactModal(true);
    } else if (availableMethods.length === 1) {
      // Directly contact using the only available method
      contactViaMethod(availableMethods[0].type);
    } else {
      alert("Seller hasn't provided any contact information yet.");
    }
  };

  const contactViaMethod = async (method: string) => {
    const selected = domains.filter(d => selectedIds.includes(d.id));
    const seller = selected[0].user;
    const domainNames = selected.map(d => d.name).join(', ');
    const message = `Hi, I'm interested in these domains: ${domainNames}`;

    setShowContactModal(false);

    switch (method) {
      case 'twitter':
        if (seller.twitterHandle) {
          await navigator.clipboard.writeText(message);
          window.open(`https://twitter.com/messages/compose?recipient_id=${seller.twitterHandle}`, '_blank');
        }
        break;

      case 'whatsapp':
        if (seller.whatsappNumber) {
          const encodedMessage = encodeURIComponent(message);
          window.open(`https://wa.me/${seller.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`, '_blank');
        }
        break;

      case 'linkedin':
        if (seller.linkedinProfile) {
          await navigator.clipboard.writeText(message);
          window.open(seller.linkedinProfile, '_blank');
        }
        break;

      case 'telegram':
        if (seller.telegramUsername) {
          const encodedMessage = encodeURIComponent(message);
          window.open(`https://t.me/${seller.telegramUsername}?text=${encodedMessage}`, '_blank');
        }
        break;

      case 'email':
      default:
        const email = seller.contactEmail || seller.email;
        if (email) {
          const subject = `Inquiry about ${domainNames}`;
          const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
          window.open(mailtoLink, '_blank');
        }
        break;
    }
  };

  return (
    <div className="min-h-screen dark:bg-[#050505] bg-gray-50 dark:text-white text-gray-900 font-sans dark:selection:bg-amber-500/30 selection:bg-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 py-8 pb-32 md:pb-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-8">
            <div className="text-center md:text-left w-full md:w-auto">
              <Link href="/" className="inline-block group">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <Logo className="h-11 w-auto transition-transform group-hover:scale-105 duration-300" />
                </div>
              </Link>
              <div className="flex items-center gap-3 justify-center md:justify-start mt-3">
                <span className="h-px w-8 bg-gradient-to-r from-amber-500/50 to-transparent hidden md:block"></span>
                <p className="text-xs font-semibold tracking-[0.2em] text-gray-500 dark:text-gray-400 uppercase">
                  Domain Liquidation Platform
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
              <div className="flex gap-2 shrink-0">
                {session ? (
                  <Link
                    href="/dashboard"
                    className="group relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center gap-2 text-sm">
                      Dashboard
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium dark:text-gray-300 text-gray-700 dark:hover:text-white hover:text-gray-900 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Contact Method Selection Modal */}
          {showContactModal && selectedIds.length > 0 && (() => {
            const selected = domains.filter(d => selectedIds.includes(d.id));
            const seller = selected[0]?.user;
            if (!seller) return null;

            const availableMethods = [
              seller.contactEmail && { type: 'email', label: 'Email', icon: '📧' },
              seller.twitterHandle && { type: 'twitter', label: 'Twitter/X', icon: '𝕏' },
              seller.whatsappNumber && { type: 'whatsapp', label: 'WhatsApp', icon: '💬' },
              seller.linkedinProfile && { type: 'linkedin', label: 'LinkedIn', icon: '💼' },
              seller.telegramUsername && { type: 'telegram', label: 'Telegram', icon: '✈️' },
            ].filter(Boolean) as Array<{ type: string; label: string; icon: string }>;

            return (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowContactModal(false)}>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-xl font-bold text-white mb-4">Choose Contact Method</h3>
                  <div className="space-y-2">
                    {availableMethods.map((method) => (
                      <button
                        key={method.type}
                        onClick={() => contactViaMethod(method.type)}
                        className="w-full flex items-center gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/50 transition-all text-left"
                      >
                        <span className="text-2xl">{method.icon}</span>
                        <span className="text-white font-medium">{method.label}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="mt-4 w-full py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Escrow Modal */}
          {showEscrowModal && selectedEscrowDomain && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEscrowModal(false)}>
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center border border-green-500/20">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Buy with Escrow.com</h3>
                    <p className="text-xs text-gray-400">Secure transaction for {selectedEscrowDomain.name}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                    <p className="text-sm text-gray-300 mb-2">
                      This domain is listed for <span className="text-white font-bold">${selectedEscrowDomain.price.toLocaleString()}</span>.
                    </p>
                    <p className="text-sm text-gray-400">
                      Enter your email address to start a secure transaction on Escrow.com. You will be redirected to complete the purchase.
                    </p>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const email = (form.elements.namedItem('buyerEmail') as HTMLInputElement).value;
                      const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
                      const originalText = btn.innerHTML;

                      try {
                        btn.disabled = true;
                        btn.innerHTML = '<span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span> Processing...';

                        const res = await fetch('/api/escrow/create-transaction', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            domain: selectedEscrowDomain.name,
                            price: selectedEscrowDomain.price,
                            buyerEmail: email,
                            sellerEmail: selectedEscrowDomain.user.escrowEmail
                          })
                        });

                        const data = await res.json();

                        if (!res.ok) throw new Error(data.error || 'Failed to start transaction');

                        if (data.landing_page) {
                          window.location.href = data.landing_page;
                        } else {
                          throw new Error('No redirect URL received');
                        }

                      } catch (error: any) {
                        alert(error.message);
                        btn.disabled = false;
                        btn.innerHTML = originalText;
                      }
                    }}
                  >
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Your Email Address</label>
                      <input
                        type="email"
                        name="buyerEmail"
                        required
                        placeholder="you@example.com"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-green-500/50"
                      />
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        Start Secure Transaction
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEscrowModal(false)}
                        className="w-full py-2 text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Domains (2/3) */}
          <div className="lg:col-span-2 dark:bg-[#0A0A0A] bg-white border dark:border-white/10 border-gray-200 rounded-xl p-6 h-fit shadow-sm">
            {/* Section Title & Controls */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 relative">
              <div className="text-center md:text-left w-full md:w-auto">
                <h2 className="text-xl font-bold dark:text-white text-gray-900">Recently Added Domains</h2>
                <p className="dark:text-gray-400 text-gray-600 text-xs mt-1">Fresh listing from the sellers</p>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto justify-center md:justify-end">
                <div className="relative w-full md:w-64 group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 dark:text-gray-600 text-gray-400 group-focus-within:text-gray-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search domains..."
                    className="block w-full pl-9 pr-4 py-2 dark:border-white/10 border-gray-300 rounded-lg dark:bg-white/5 bg-gray-50 dark:text-gray-300 text-gray-900 dark:placeholder-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 dark:focus:bg-white/10 focus:bg-white transition-all text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <button
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${showFilterPanel || filterTLD.length > 0 || filterPrice.min || filterPrice.max || filterVerified
                    ? 'bg-amber-500 text-white'
                    : 'dark:bg-white/10 bg-gray-100 dark:hover:bg-white/20 hover:bg-gray-200 dark:text-white text-gray-700'
                    }`}
                >
                  <Filter className="h-4 w-4" />
                  Filter
                  {(filterTLD.length > 0 || filterPrice.min || filterPrice.max || filterVerified) && (
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                      •
                    </span>
                  )}
                </button>
              </div>

              {/* Filter Panel */}
              {showFilterPanel && (
                <div className="absolute top-full right-0 mt-2 w-full md:w-80 dark:bg-[#0A0A0A] bg-gray-100 border dark:border-white/20 border-gray-200 rounded-xl shadow-2xl z-40 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold dark:text-white text-gray-900">Filters</h3>
                    <button onClick={() => setShowFilterPanel(false)} className="dark:text-gray-400 text-gray-500 dark:hover:text-white hover:text-gray-900 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* TLDs */}
                  <div className="mb-4">
                    <label className="text-xs font-medium dark:text-gray-400 text-gray-600 mb-2 block">Extensions</label>
                    <div className="flex flex-wrap gap-2">
                      {commonTLDs.map(tld => (
                        <button
                          key={tld}
                          onClick={() => {
                            setFilterTLD(prev =>
                              prev.includes(tld) ? prev.filter(t => t !== tld) : [...prev, tld]
                            );
                            setPage(1);
                          }}
                          className={`px-2 py-1 text-xs rounded-md border transition-colors ${filterTLD.includes(tld)
                            ? 'bg-amber-500 border-amber-500 text-white'
                            : 'dark:bg-white/5 bg-gray-50 dark:border-white/10 border-gray-300 dark:text-gray-300 text-gray-600 dark:hover:bg-white/10 hover:bg-gray-100'
                            }`}
                        >
                          .{tld}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-4">
                    <label className="text-xs font-medium dark:text-gray-400 text-gray-600 mb-2 block">Price Range ($)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filterPrice.min}
                        onChange={e => {
                          setFilterPrice(prev => ({ ...prev, min: e.target.value }));
                          setPage(1);
                        }}
                        className="w-full dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg px-3 py-1.5 text-sm dark:text-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filterPrice.max}
                        onChange={e => {
                          setFilterPrice(prev => ({ ...prev, max: e.target.value }));
                          setPage(1);
                        }}
                        className="w-full dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg px-3 py-1.5 text-sm dark:text-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                      />
                    </div>
                  </div>

                  {/* Status & Sort */}
                  <div className="mb-4 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filterVerified}
                        onChange={e => {
                          setFilterVerified(e.target.checked);
                          setPage(1);
                        }}
                        className="rounded dark:border-white/10 border-gray-300 dark:bg-white/5 bg-gray-50 text-amber-500 focus:ring-amber-500/50"
                      />
                      <span className="text-sm dark:text-gray-300 text-gray-700">Verified Only</span>
                    </label>

                    <div>
                      <label className="text-xs font-medium dark:text-gray-400 text-gray-600 mb-2 block">Sort By</label>
                      <select
                        value={sortBy}
                        onChange={e => {
                          setSortBy(e.target.value);
                          setPage(1);
                        }}
                        className="w-full dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg px-3 py-1.5 text-sm dark:text-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                      >
                        <option value="newest">Newest Listed</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="expires_asc">Expiring Soon</option>
                        <option value="expires_desc">Expiring Later</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setFilterTLD([]);
                      setFilterPrice({ min: '', max: '' });
                      setFilterVerified(false);
                      setSortBy('newest');
                      setPage(1);
                    }}
                    className="w-full py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border-t border-gray-200 dark:border-white/10"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                // Skeleton loading
                [...Array(6)].map((_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
                ))
              ) : domains.length > 0 ? (
                <>
                  {domains.map(domain => {
                    const isSelected = selectedIds.includes(domain.id);
                    const isSold = domain.status === 'sold';

                    return (
                      <div
                        key={domain.id}
                        onClick={() => !isSold && toggleSelection(domain.id)}
                        className={`
                          group flex flex-col justify-center p-3 rounded-lg border transition-all duration-200 cursor-pointer relative
                          ${isSold
                            ? 'dark:bg-transparent bg-gray-100 border-transparent opacity-40 cursor-not-allowed'
                            : isSelected
                              ? 'dark:bg-indigo-900/10 bg-amber-50 dark:border-amber-500/50 border-amber-400'
                              : 'dark:bg-white/5 bg-gray-50 border-transparent dark:hover:bg-white/10 hover:bg-white hover:border-gray-200 dark:hover:shadow-xl dark:hover:shadow-black/20 shadow-sm hover:shadow-md'
                          }
                        `}
                      >
                        {/* Selection Indicator */}
                        {!isSold && (
                          <div className={`
                            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all z-20
                            ${isSelected
                              ? 'bg-amber-500 border-amber-500 scale-100 opacity-100'
                              : 'dark:border-white/20 border-gray-300 dark:bg-black/40 bg-white/60 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 backdrop-blur-sm'
                            }
                          `}>
                            {isSelected && (
                              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                            )}
                          </div>
                        )}

                        <div className="flex flex-col gap-3 h-full justify-between">
                          {/* Top Row: Name and Price */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <h3 className="text-sm font-bold dark:text-white text-gray-900 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors truncate leading-tight" title={domain.name}>
                                {domain.name}
                              </h3>
                              {domain.isVerified && (
                                <div className="group/tooltip relative">
                                  <ShieldCheck className="h-3.5 w-3.5 text-green-500 shrink-0 cursor-help" />
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-white bg-black/90 rounded whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20 border border-white/10">
                                    Ownership verified
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black/90"></div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className={`font-mono text-sm shrink-0 ${isSold ? 'dark:text-gray-600 text-gray-400' : 'dark:text-gray-400 text-gray-600'}`}>
                              ${domain.price.toLocaleString()}
                            </div>
                          </div>

                          {/* Bottom Row: Seller/Status and Visit Button */}
                          <div className="flex items-end justify-between gap-4">
                            <div className="flex flex-col gap-1 min-w-0">
                              <div className="flex items-center gap-2 text-[10px] dark:text-gray-500 text-gray-600">
                                <Link
                                  href={`/u/${domain.user.subdomain}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="dark:hover:text-amber-400 hover:text-amber-600 transition-colors truncate max-w-[100px]"
                                >
                                  {domain.user.name || domain.user.subdomain}
                                </Link>
                                {isSold && (
                                  <span className="px-1 py-0.5 text-[9px] font-medium bg-amber-500/20 text-amber-500 dark:text-amber-400 rounded-full">
                                    SOLD
                                  </span>
                                )}
                                {!isSold && domain.price >= 500 && domain.isVerified && domain.user.escrowEmail && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEscrowDomain(domain);
                                      setShowEscrowModal(true);
                                    }}
                                    className="px-1.5 py-0.5 text-[9px] font-medium bg-green-500/20 text-green-500 dark:text-green-400 hover:bg-green-500/30 rounded-full border border-green-500/20 transition-colors flex items-center gap-1"
                                  >
                                    <ShieldCheck className="w-2.5 h-2.5" />
                                    Buy with Escrow
                                  </button>
                                )}
                                {domain.expiresAt && (
                                  <>
                                    <span className="dark:text-gray-700 text-gray-400">•</span>
                                    <span>
                                      Exp: {new Date(domain.expiresAt).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', year: '2-digit' })}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <Link
                              href={`/d/${domain.name}`}
                              onClick={(e) => e.stopPropagation()}
                              className="group/visit flex items-center gap-1 px-2 py-0.5 text-[9px] font-medium dark:bg-white/5 bg-gray-100 dark:hover:bg-white/10 hover:bg-gray-200 dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 rounded-full border dark:border-white/5 border-gray-200 dark:hover:border-white/20 hover:border-gray-300 transition-all shrink-0"
                            >
                              <span className="uppercase tracking-wider">Visit</span>
                              <ExternalLink className="w-2 h-2 opacity-50 group-hover/visit:opacity-100 transition-opacity" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="col-span-full text-center py-12 text-gray-600">
                  No domains found.
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {domains.length > 0 && (
              <div className="mt-8 flex flex-col md:flex-row items-center justify-between border-t border-gray-200 dark:border-white/10 pt-4 gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing <span className="font-medium text-gray-900 dark:text-white">{(page - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-gray-900 dark:text-white">{Math.min(page * itemsPerPage, totalDomains)}</span> of <span className="font-medium text-gray-900 dark:text-white">{totalDomains}</span> results
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={handleLimitChange}
                      className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                    >
                      <option value={20}>20</option>
                      <option value={40}>40</option>
                      <option value={60}>60</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1 || isLoading}
                    className="px-3 py-1 text-sm bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!hasMore || isLoading}
                    className="px-3 py-1 text-sm bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Top Liquidators (1/3) */}
          <div className="lg:col-span-1 lg:col-start-3">
            <div className="dark:bg-[#0A0A0A] bg-white border dark:border-white/10 border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl font-bold dark:text-white text-gray-900">Top Liquidators</h2>
              </div>

              <div className="space-y-4">
                {topSellers.length > 0 ? (
                  topSellers.map((seller, index) => (
                    <Link
                      key={seller.id}
                      href={`/u/${seller.subdomain}`}
                      className="flex items-center justify-between p-3 rounded-lg dark:bg-white/5 bg-gray-50 dark:hover:bg-white/10 hover:bg-gray-100 border border-transparent dark:hover:border-white/10 hover:border-gray-200 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                          ${index === 0 ? 'bg-amber-500 text-white' :
                            index === 1 ? 'dark:bg-gray-300 bg-gray-400 text-black' :
                              index === 2 ? 'bg-amber-700 text-white' :
                                'dark:bg-white/10 bg-gray-200 dark:text-gray-400 text-gray-600'}\
                        `}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium dark:text-white text-gray-900 dark:group-hover:text-amber-400 group-hover:text-amber-600 transition-colors">
                            {seller.name}
                          </h3>
                          <p className="text-xs dark:text-gray-500 text-gray-600">@{seller.subdomain}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 dark:text-gray-400 text-gray-600 dark:group-hover:text-white group-hover:text-gray-900 transition-colors">
                        <span className="text-sm font-medium">{seller.domainCount}</span>
                        <ExternalLink className="h-3 w-3" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8 dark:text-gray-600 text-gray-500">
                    Loading top sellers...
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Action Bar (Mobile Optimized) */}
      <div className={`
        fixed bottom-0 left-0 right-0 p-4 dark:bg-[#050505]/90 bg-white/95 backdrop-blur-md border-t dark:border-white/10 border-gray-200 z-50 transition-transform duration-300 shadow-xl
        ${selectedIds.length > 0 ? 'translate-y-0' : 'translate-y-full'}
      `}>
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="text-sm dark:text-gray-400 text-gray-600">
            <span className="dark:text-white text-gray-900 font-medium">{selectedIds.length}</span> selected
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="p-3 rounded-lg dark:bg-white/10 bg-gray-100 dark:hover:bg-white/20 hover:bg-gray-200 dark:text-white text-gray-900 transition-colors"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>

            <button
              onClick={handleContact}
              className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg bg-amber-500 hover:bg-amber-600 dark:hover:bg-amber-400 text-white font-medium transition-colors text-sm md:text-base"
            >
              <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
              <span>Contact Seller</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
