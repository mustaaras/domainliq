'use client';

import { useState, useEffect } from 'react';
import { Share2, MessageCircle, Check, Search, Loader2, ShieldCheck, Filter, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

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
  };
  isVerified?: boolean;
  expiresAt?: string | null;
}

export default function Home() {
  const { data: session } = useSession();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalDomains, setTotalDomains] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);

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
        ...(filterPrice.max && { maxPrice: filterPrice.max }),
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
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500/30">
      <div className="max-w-3xl mx-auto px-4 py-8 pb-32 md:pb-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-8">
            <div className="text-center md:text-left w-full md:w-auto">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <Link href="/">
                  <img src="/logo.svg" alt="DomainLiq" className="h-12 w-auto cursor-pointer" />
                </Link>
              </div>
              <p className="text-gray-500 mt-1">Domain Liquidation Listing Platform</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
              <div className="relative w-full md:w-72 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-600 group-focus-within:text-gray-400 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search domains..."
                  className="block w-full pl-9 pr-4 py-2 border border-white/10 rounded-lg bg-white/5 text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 focus:bg-white/10 transition-all text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2 shrink-0">
                {session ? (
                  <Link
                    href="/dashboard"
                    className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-300 hover:text-white transition-colors"
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
        </header>

        {/* Section Title & Controls */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 relative">
          <div className="text-center md:text-left w-full md:w-auto">
            <h2 className="text-xl font-bold text-white">Recently Added Domains</h2>
            <p className="text-gray-400 text-xs mt-1">Fresh listing from the sellers</p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${showFilterPanel || filterTLD.length > 0 || filterPrice.min || filterPrice.max || filterVerified
                ? 'bg-amber-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
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
            <div className="absolute top-full right-0 mt-2 w-full md:w-80 bg-[#0A0A0A] border border-white/20 rounded-xl shadow-2xl z-40 p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-white">Filters</h3>
                <button onClick={() => setShowFilterPanel(false)} className="text-gray-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* TLDs */}
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-400 mb-2 block">Extensions</label>
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
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                        }`}
                    >
                      .{tld}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-400 mb-2 block">Price Range ($)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filterPrice.min}
                    onChange={e => {
                      setFilterPrice(prev => ({ ...prev, min: e.target.value }));
                      setPage(1);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filterPrice.max}
                    onChange={e => {
                      setFilterPrice(prev => ({ ...prev, max: e.target.value }));
                      setPage(1);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50"
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
                    className="rounded border-white/10 bg-white/5 text-amber-500 focus:ring-amber-500/50"
                  />
                  <span className="text-sm text-gray-300">Verified Only</span>
                </label>

                <div>
                  <label className="text-xs font-medium text-gray-400 mb-2 block">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={e => {
                      setSortBy(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50"
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
                className="w-full py-2 text-xs text-gray-400 hover:text-white transition-colors border-t border-white/10"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* List */}
        <div className="flex flex-col gap-2">
          {isLoading ? (
            // Skeleton loading
            [...Array(6)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
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
                      group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer
                      ${isSold
                        ? 'bg-transparent border-transparent opacity-40 cursor-not-allowed'
                        : isSelected
                          ? 'bg-indigo-900/10 border-amber-500/50'
                          : 'bg-white/5 border-transparent hover:bg-white/10'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {!isSold && (
                        <div className={`
                          shrink-0 w-5 h-5 rounded border-2 transition-all
                          ${isSelected
                            ? 'bg-amber-500 border-amber-500'
                            : 'border-gray-600 group-hover:border-amber-500/50'
                          }
                        `}>
                          {isSelected && (
                            <svg className="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-white group-hover:text-amber-400 transition-colors truncate">
                            {domain.name}
                          </h3>
                          {isSold && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full whitespace-nowrap">
                              SOLD
                            </span>
                          )}
                          {domain.isVerified && (
                            <ShieldCheck className="h-4 w-4 text-green-500 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
                          <Link
                            href={`/u/${domain.user.subdomain}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-amber-400 transition-colors"
                          >
                            by {domain.user.name || domain.user.subdomain}
                          </Link>
                          {domain.expiresAt && (
                            <>
                              <span>•</span>
                              <span>
                                Expires {new Date(domain.expiresAt).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={`shrink-0 font-mono transition-colors ${isSold ? 'text-gray-600' : 'text-gray-400'}`}>
                      ${domain.price.toLocaleString()}
                    </div>
                  </div>
                );
              })}

              {/* Pagination Controls */}
              <div className="mt-8 flex flex-col md:flex-row items-center justify-between border-t border-white/10 pt-4 gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-400">
                    Showing <span className="font-medium text-white">{(page - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-white">{Math.min(page * itemsPerPage, totalDomains)}</span> of <span className="font-medium text-white">{totalDomains}</span> results
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={handleLimitChange}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                    >
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1 || isLoading}
                    className="px-3 py-1 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!hasMore || isLoading}
                    className="px-3 py-1 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-600">
              No domains found.
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Bar (Mobile Optimized) */}
      <div className={`
        fixed bottom-0 left-0 right-0 p-4 bg-[#050505]/90 backdrop-blur-md border-t border-white/10 z-50 transition-transform duration-300
        ${selectedIds.length > 0 ? 'translate-y-0' : 'translate-y-full'}
      `}>
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="text-sm text-gray-400">
            <span className="text-white font-medium">{selectedIds.length}</span> selected
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>

            <button
              onClick={handleContact}
              className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-white font-medium transition-colors text-sm md:text-base"
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
