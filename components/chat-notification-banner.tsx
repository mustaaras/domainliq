'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { MessageCircle, X, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function ChatNotificationBanner() {
    const { status } = useSession();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Don't show on the chat page itself
        if (pathname === '/dashboard/chat') {
            setIsVisible(false);
            return;
        }

        if (status === 'authenticated' && !isDismissed) {
            checkUnreadMessages();
        }
    }, [status, pathname, isDismissed]);

    const checkUnreadMessages = async () => {
        try {
            const res = await fetch('/api/user/chat/unread');
            if (res.ok) {
                const data = await res.json();
                if (data.count > 0) {
                    setUnreadCount(data.count);
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            }
        } catch (error) {
            console.error('Failed to check unread messages:', error);
        }
    };

    if (!isVisible || unreadCount === 0 || status !== 'authenticated') return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>

                <div className="relative flex items-center gap-4 p-4 pr-12 bg-white dark:bg-[#0A0A0A]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    {/* Icon Bubble */}
                    <div className="relative">
                        <div className="absolute -inset-1 bg-amber-500/20 rounded-full blur-sm animate-pulse"></div>
                        <div className="relative h-10 w-10 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-lg">
                            <MessageCircle className="h-5 w-5" />
                            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-[#0A0A0A]">
                                {unreadCount}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">
                            New Messages
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            You have {unreadCount} unread {unreadCount === 1 ? 'chat' : 'chats'} waiting.
                        </p>
                    </div>

                    {/* Action */}
                    <Link
                        href="/dashboard/chat"
                        className="absolute inset-0 z-10"
                        onClick={() => setIsVisible(false)}
                    >
                        <span className="sr-only">View Messages</span>
                    </Link>

                    {/* Close Button (z-20 to sit above the link) */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsVisible(false);
                            setIsDismissed(true);
                        }}
                        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors z-20"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>

                    {/* Hover Arrow Indicator */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
                        <ArrowRight className="h-5 w-5 text-amber-500" />
                    </div>
                </div>
            </div>
        </div>
    );
}
