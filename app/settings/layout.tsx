'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, CreditCard, Shield, Settings, LogOut, LayoutDashboard, ArrowLeft, Globe } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const tabs = [
        { name: 'Profile', href: '/settings', icon: User },
        { name: 'Custom Domains', href: '/settings/custom-domains', icon: Globe },
        { name: 'Integrations', href: '/settings/integrations', icon: LayoutDashboard },
    ];

    return (
        <div className="min-h-screen dark:bg-[#050505] bg-gray-50 dark:text-white text-gray-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <Link href="/">
                            <Logo className="h-8 w-auto cursor-pointer" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                        <Link
                            href="/dashboard"
                            className="p-2 dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/5 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight dark:text-white text-gray-900">Settings</h1>
                        </div>
                    </div>
                    <p className="dark:text-gray-400 text-gray-600 ml-14">Manage your profile and integrations</p>
                </header>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="w-full md:w-64 shrink-0">
                        <nav className="space-y-1">
                            {tabs.map((tab) => {
                                const isActive = pathname === tab.href;
                                const Icon = tab.icon;
                                return (
                                    <Link
                                        key={tab.name}
                                        href={tab.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? 'bg-amber-500 text-white shadow-md'
                                            : 'dark:text-gray-400 text-gray-700 dark:hover:text-white hover:text-gray-900 dark:hover:bg-white/5 hover:bg-gray-200'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {tab.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div >
        </div >
    );
}
