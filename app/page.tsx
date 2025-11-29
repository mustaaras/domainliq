'use client';

import { useState, useEffect } from 'react';
import { Share2, MessageCircle, Check, Search, Loader2 } from 'lucide-react';
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
    name: string | null;
    subdomain: string;
    email: string | null; // Added for fallback
    contactEmail: string | null;
    twitterHandle: string | null;
    whatsappNumber: string | null;
    linkedinProfile: string | null;
    telegramUsername: string | null;
    preferredContact: string;
  };
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

  const fetchDomains = async (pageNum: number, isLoadMore = false) => {
    try {
      if (isLoadMore) setIsLoadingMore(true);

      const res = await fetch(`/api/domains?page=${pageNum}&limit=20&search=${searchQuery}`);
      const data = await res.json();

      if (data.error) {
        console.error('API Error:', data.error);
        return;
      }

      if (isLoadMore) {
        setDomains(prev => [...prev, ...data.domains]);
      } else {
        setDomains(data.domains);
      }

      if (data.pagination) {
        setHasMore(data.pagination.page < data.pagination.pages);
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
      fetchDomains(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDomains(nextPage, true);
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

  const handleContact = async () => {
    const selected = domains.filter(d => selectedIds.includes(d.id));
    if (selected.length === 0) return;

    const seller = selected[0].user;
    const domainNames = selected.map(d => d.name).join(', ');
    const message = `Hi, I'm interested in these domains: ${domainNames}`;

    switch (seller.preferredContact) {
      case 'twitter':
        if (seller.twitterHandle) {
          await navigator.clipboard.writeText(message);
          window.open(`https://x.com/messages/compose?recipient=${seller.twitterHandle}`, '_blank');
        } else {
          alert("Seller hasn't provided their X handle yet.");
        }
        break;

      case 'whatsapp':
        if (seller.whatsappNumber) {
          const encodedMessage = encodeURIComponent(message);
          window.open(`https://wa.me/${seller.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`, '_blank');
        } else {
          alert("Seller hasn't provided their WhatsApp number yet.");
        }
        break;

      case 'linkedin':
        if (seller.linkedinProfile) {
          await navigator.clipboard.writeText(message);
          window.open(seller.linkedinProfile, '_blank');
        } else {
          alert("Seller hasn't provided their LinkedIn profile yet.");
        }
        break;

      case 'telegram':
        if (seller.telegramUsername) {
          const encodedMessage = encodeURIComponent(message);
          window.open(`https://t.me/${seller.telegramUsername}?text=${encodedMessage}`, '_blank');
        } else {
          alert("Seller hasn't provided their Telegram username yet.");
        }
        break;

      case 'email':
      default:
        const email = seller.contactEmail || seller.email; // Fallback to login email
        if (email) {
          const subject = `Inquiry about ${domainNames}`;
          const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
          window.open(mailtoLink, '_blank');
        } else {
          alert("Seller contact email not found.");
        }
        break;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500/30">
      <div className="max-w-3xl mx-auto px-4 py-8 pb-32 md:pb-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3">
                <img src="/logo.svg" alt="DomainLiq" className="h-12 w-auto" />
              </div>
              <p className="text-gray-500 mt-1">Domain Liquidation Marketplace</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
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
        </header>

        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Recently Added Domains</h2>
          <p className="text-gray-400 text-sm mt-1">Fresh listings from our marketplace</p>
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
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200 flex-shrink-0
                        ${isSold
                          ? 'border-gray-700 bg-gray-800'
                          : isSelected
                            ? 'bg-amber-500 border-amber-500'
                            : 'border-gray-600 group-hover:border-gray-500'
                        }
                      `}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                        {isSold && <div className="w-2 h-2 rounded-full bg-gray-600" />}
                      </div>

                      <div className="flex flex-col">
                        <span className={`text-lg font-medium ${isSelected ? 'text-white' : 'text-gray-200'} ${isSold && 'line-through'}`}>
                          {domain.name}
                        </span>
                        <Link
                          href={`/${domain.user.subdomain}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-gray-500 hover:text-amber-400 transition-colors"
                        >
                          by {domain.user.name || domain.user.subdomain}
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {isSold ? (
                        <span className="text-xs font-medium text-red-400 uppercase tracking-wider">Sold</span>
                      ) : (
                        <span className={`font-mono ${isSelected ? 'text-indigo-300' : 'text-gray-400'}`}>
                          ${domain.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="mt-4 py-3 px-4 w-full rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all text-sm font-medium flex items-center justify-center gap-2"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Domains'
                  )}
                </button>
              )}
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
