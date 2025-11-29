'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Save, User, Mail, Twitter, Phone, Linkedin, ArrowLeft, Send } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
    const router = useRouter();
    const sessionData = useSession();
    const { data: session, status } = sessionData || {};
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subdomain: '',
        contactEmail: '',
        twitterHandle: '',
        whatsappNumber: '',
        linkedinProfile: '',
        telegramUsername: '',
        preferredContact: 'email'
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated') {
            fetchUserData();
        }
    }, [status, router]);

    const fetchUserData = async () => {
        try {
            const res = await fetch('/api/user/settings');
            if (!res.ok) throw new Error('Failed to fetch user data');
            const data = await res.json();
            setFormData({
                name: data.name || '',
                email: data.email || '',
                subdomain: data.subdomain || '',
                contactEmail: data.contactEmail || '',
                twitterHandle: data.twitterHandle || '',
                whatsappNumber: data.whatsappNumber || '',
                linkedinProfile: data.linkedinProfile || '',
                telegramUsername: data.telegramUsername || '',
                preferredContact: data.preferredContact || 'email'
            });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to load profile data' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/user/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to update profile');

            setMessage({ type: 'success', text: 'Profile updated successfully' });
            router.refresh();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setIsChangingPassword(true);

        try {
            const res = await fetch('/api/user/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to change password');
            }

            setPasswordMessage({ type: 'success', text: 'Password changed successfully' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            setPasswordMessage({ type: 'error', text: error.message });
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <header className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Link
                            href="/dashboard"
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                        </div>
                    </div>
                    <p className="text-gray-400 ml-14">Manage your profile and contact preferences</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <User className="h-5 w-5 text-amber-400" />
                            Basic Information
                        </h2>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Username (Subdomain)</label>
                                <input
                                    type="text"
                                    value={formData.subdomain}
                                    disabled
                                    className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Methods */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Mail className="h-5 w-5 text-amber-400" />
                            Contact Methods
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Contact Email</label>
                                <input
                                    type="email"
                                    value={formData.contactEmail}
                                    onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                                    placeholder="Where buyers should email you"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    <span className="flex items-center gap-2">
                                        <Twitter className="h-4 w-4" /> X (Twitter) Handle
                                    </span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-2 text-gray-500">@</span>
                                    <input
                                        type="text"
                                        value={formData.twitterHandle}
                                        onChange={e => setFormData({ ...formData, twitterHandle: e.target.value.replace('@', '') })}
                                        placeholder="username"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg pl-8 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    <span className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" /> WhatsApp Number
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.whatsappNumber}
                                    onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                    placeholder="+1234567890"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    <span className="flex items-center gap-2">
                                        <Linkedin className="h-4 w-4" /> LinkedIn Profile URL
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.linkedinProfile}
                                    onChange={e => setFormData({ ...formData, linkedinProfile: e.target.value })}
                                    placeholder="https://linkedin.com/in/username"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    <span className="flex items-center gap-2">
                                        <Send className="h-4 w-4" /> Telegram Username
                                    </span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-500">@</span>
                                    <input
                                        type="text"
                                        value={formData.telegramUsername}
                                        onChange={e => setFormData({ ...formData, telegramUsername: e.target.value.replace('@', '') })}
                                        placeholder="username"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg pl-8 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Contact Method</label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {['email', 'twitter', 'whatsapp', 'linkedin', 'telegram'].map((method) => (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, preferredContact: method })}
                                        className={`
                      px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
                      ${formData.preferredContact === method
                                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }
                    `}
                                    >
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`p-4 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            Save Changes
                        </button>
                    </div>
                </form>

                {/* Password Change Section */}
                <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-6">Change Password</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                required
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                required
                                minLength={6}
                            />
                        </div>

                        {passwordMessage.text && (
                            <div className={`p-4 rounded-lg text-sm ${passwordMessage.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                {passwordMessage.text}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isChangingPassword}
                                className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                            >
                                {isChangingPassword ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                Change Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
