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

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch('/api/user/delete', {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete account');

            // Sign out and redirect
            window.location.href = '/';
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete account. Please try again.');
            setIsDeleting(false);
        }
    };

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
            <div className="min-h-screen dark:bg-[#050505] bg-white flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="dark:bg-white/5 bg-white border dark:border-white/10 border-gray-200 rounded-xl p-6 space-y-6 shadow-sm">
                    <h2 className="text-xl font-semibold flex items-center gap-2 dark:text-white text-gray-900">
                        <User className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                        Basic Information
                    </h2>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full dark:bg-black/20 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg px-4 py-2 dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">Username (Subdomain)</label>
                            <input
                                type="text"
                                value={formData.subdomain}
                                disabled
                                className="w-full dark:bg-black/40 bg-gray-100 border dark:border-white/5 border-gray-200 rounded-lg px-4 py-2 dark:text-gray-500 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Methods */}
                <div className="dark:bg-white/5 bg-white border dark:border-white/10 border-gray-200 rounded-xl p-6 space-y-6 shadow-sm">
                    <h2 className="text-xl font-semibold flex items-center gap-2 dark:text-white text-gray-900">
                        <Mail className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                        Contact Methods
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">Contact Email</label>
                            <input
                                type="email"
                                value={formData.contactEmail}
                                onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                                placeholder="Where buyers should email you"
                                className="w-full dark:bg-black/20 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg px-4 py-2 dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                                <span className="flex items-center gap-2">
                                    <Twitter className="h-4 w-4" /> X (Twitter) Handle
                                </span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-2 dark:text-gray-500 text-gray-400">@</span>
                                <input
                                    type="text"
                                    value={formData.twitterHandle}
                                    onChange={e => setFormData({ ...formData, twitterHandle: e.target.value.replace('@', '') })}
                                    placeholder="username"
                                    className="w-full dark:bg-black/20 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg pl-8 pr-4 py-2 dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                                <span className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" /> WhatsApp Number
                                </span>
                            </label>
                            <input
                                type="text"
                                value={formData.whatsappNumber}
                                onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                placeholder="+1234567890"
                                className="w-full dark:bg-black/20 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg px-4 py-2 dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                                <span className="flex items-center gap-2">
                                    <Linkedin className="h-4 w-4" /> LinkedIn Profile URL
                                </span>
                            </label>
                            <input
                                type="text"
                                value={formData.linkedinProfile}
                                onChange={e => setFormData({ ...formData, linkedinProfile: e.target.value })}
                                placeholder="https://linkedin.com/in/username"
                                className="w-full dark:bg-black/20 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg px-4 py-2 dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                                <span className="flex items-center gap-2">
                                    <Send className="h-4 w-4" /> Telegram Username
                                </span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 dark:text-gray-500 text-gray-400">@</span>
                                <input
                                    type="text"
                                    value={formData.telegramUsername}
                                    onChange={e => setFormData({ ...formData, telegramUsername: e.target.value.replace('@', '') })}
                                    placeholder="username"
                                    className="w-full dark:bg-black/20 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg pl-8 pr-4 py-2 dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t dark:border-white/10 border-gray-200">
                        <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Preferred Contact Method</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {['email', 'twitter', 'whatsapp', 'linkedin', 'telegram'].map((method) => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, preferredContact: method })}
                                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
                      ${formData.preferredContact === method
                                            ? 'bg-amber-500 text-white shadow-lg dark:shadow-amber-500/20 shadow-amber-500/40'
                                            : 'dark:bg-white/5 bg-gray-100 dark:text-gray-400 text-gray-700 dark:hover:bg-white/10 hover:bg-gray-200'
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
                    <div className={`p-4 rounded-lg text-sm ${message.type === 'error' ? 'dark:bg-red-500/10 bg-red-50 dark:text-red-400 text-red-700' : 'dark:bg-green-500/10 bg-green-50 dark:text-green-400 text-green-700'}`}>
                        {message.text}
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-500 dark:hover:bg-amber-400 hover:bg-amber-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        Save Changes
                    </button>
                </div>
            </form>

            {/* Danger Zone */}
            <div className="mt-8 dark:bg-red-500/10 bg-red-50 border dark:border-red-500/30 border-red-300 rounded-xl p-6">
                <h2 className="text-xl font-semibold dark:text-red-500 text-red-700 mb-4">Danger Zone</h2>
                <p className="dark:text-gray-400 text-gray-700 mb-6">
                    Once you delete your account, there is no going back. Please be certain.
                </p>

                <div className="flex justify-between items-center">
                    <div className="text-sm dark:text-gray-400 text-gray-700">
                        <p>This action will permanently delete:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Your user profile and settings</li>
                            <li>All your listed domains</li>
                            <li>All your active sessions</li>
                        </ul>
                    </div>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Delete Account
                    </button>
                </div>
            </div >

            {/* Delete Confirmation Modal */}
            {
                showDeleteModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="dark:bg-[#0A0A0A] bg-white border dark:border-white/10 border-gray-300 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                            <h3 className="text-xl font-bold dark:text-white text-gray-900 mb-2">Delete Account?</h3>
                            <p className="dark:text-gray-400 text-gray-700 mb-6">
                                This action cannot be undone. To confirm, please type <span className="font-mono font-bold dark:text-white text-gray-900">DELETE</span> below.
                            </p>

                            <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                placeholder="Type DELETE to confirm"
                                className="w-full dark:bg-black/40 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg px-4 py-3 mb-6 focus:outline-none focus:border-red-500 dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400"
                            />

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteConfirmation('');
                                    }}
                                    className="px-4 py-2 dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all flex items-center gap-2"
                                >
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
