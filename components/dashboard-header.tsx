'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ExternalLink, MessageCircle, Settings, LogOut, Menu, X, Globe } from 'lucide-react';
import { getProfileUrl } from '@/lib/utils';
import { Logo } from '@/components/logo';

export function DashboardHeader() {
    const { data: session } = useSession();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userSubdomain, setUserSubdomain] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/user/settings');
                const data = await res.json();
                if (data.subdomain) {
                    setUserSubdomain(data.subdomain);
                }
            } catch (e) {
                console.error('Failed to fetch user profile:', e);
            }
        };

        const fetchUnread = async () => {
            try {
                const res = await fetch('/api/user/chat/unread');
                const data = await res.json();
                if (typeof data.count === 'number') {
                    setUnreadCount(data.count);
                }
            } catch (e) {
                console.error(e);
            }
        };

        if (session) {
            fetchUserData();
            fetchUnread();
            const interval = setInterval(fetchUnread, 5000);
            return () => clearInterval(interval);
        }
    }, [session]);

    const handleLogout = async () => {
        await signOut({ redirect: false });
        window.location.href = '/';
    };

    return (
        <header className="relative mb-8">
            <div className="flex justify-center mb-6">
                <Link href="/">
                    <Logo className="h-8 w-auto cursor-pointer" />
                </Link>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left w-full md:w-auto">
                    <h1 className="text-3xl font-bold tracking-tight dark:text-white">Dashboard</h1>
                    <p className="dark:text-gray-400 text-gray-600 mt-1">Manage your domains and account</p>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex gap-3 items-center self-end mb-1">
                    <Link
                        href="/dashboard"
                        className="px-3 py-2 text-sm font-medium dark:text-gray-300 text-gray-700 dark:hover:text-white hover:text-gray-900 dark:bg-white/5 bg-gray-100 dark:hover:bg-white/10 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                    >
                        Overview
                    </Link>
                    <Link
                        href="/dashboard/custom-domains"
                        className="px-3 py-2 text-sm font-medium dark:text-gray-300 text-gray-700 dark:hover:text-white hover:text-gray-900 dark:bg-white/5 bg-gray-100 dark:hover:bg-white/10 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Globe className="h-4 w-4" />
                        Custom Domains
                    </Link>
                    <Link
                        href={getProfileUrl(userSubdomain)}
                        target="_blank"
                        className="px-3 py-2 text-sm font-medium dark:text-gray-300 text-gray-700 dark:hover:text-white hover:text-gray-900 dark:bg-white/5 bg-gray-100 dark:hover:bg-white/10 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <ExternalLink className="h-4 w-4" />
                        My Page
                    </Link>
                    <Link
                        href="/dashboard/chat"
                        className="relative px-3 py-2 text-sm font-medium dark:text-gray-300 text-gray-700 dark:hover:text-white hover:text-gray-900 dark:bg-white/5 bg-gray-100 dark:hover:bg-white/10 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <MessageCircle className="h-4 w-4" />
                        Messages
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </Link>
                    <Link
                        href="/settings"
                        className="p-2 dark:text-gray-300 text-gray-700 dark:hover:text-white hover:text-gray-900 dark:bg-white/5 bg-gray-100 dark:hover:bg-white/10 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Settings"
                    >
                        <Settings className="h-5 w-5" />
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="p-2 dark:text-gray-300 text-gray-700 dark:hover:text-white hover:text-gray-900 dark:bg-white/5 bg-gray-100 dark:hover:bg-white/10 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="absolute top-0 right-0 md:hidden">
                    <button
                        className="p-2 dark:text-gray-300 text-gray-700 dark:hover:text-white hover:text-gray-900 dark:bg-white/5 bg-gray-100 dark:hover:bg-white/10 hover:bg-gray-200 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 dark:bg-[#111] bg-white border dark:border-white/10 border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden md:hidden">
                    <div className="flex flex-col p-1">
                        <Link
                            href="/dashboard"
                            className="px-4 py-3 text-sm font-medium dark:text-gray-300 text-gray-700 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/5 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Overview
                        </Link>
                        <Link
                            href="/dashboard/custom-domains"
                            className="px-4 py-3 text-sm font-medium dark:text-gray-300 text-gray-700 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/5 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Globe className="h-4 w-4" />
                            Custom Domains
                        </Link>
                        <Link
                            href={getProfileUrl(userSubdomain)}
                            target="_blank"
                            className="px-4 py-3 text-sm font-medium dark:text-gray-300 text-gray-700 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/5 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <ExternalLink className="h-4 w-4" />
                            My Page
                        </Link>
                        <Link
                            href="/dashboard/chat"
                            className="px-4 py-3 text-sm font-medium dark:text-gray-300 text-gray-700 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/5 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3 relative"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <MessageCircle className="h-4 w-4" />
                            Messages
                            {unreadCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </Link>
                        <Link
                            href="/settings"
                            className="px-4 py-3 text-sm font-medium dark:text-gray-300 text-gray-700 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/5 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Settings className="h-4 w-4" />
                            Settings
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-3 text-sm font-medium dark:text-gray-300 text-gray-700 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/5 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3 w-full text-left"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}
