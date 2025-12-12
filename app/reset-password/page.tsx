'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/logo';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setMessage({ type: 'error', text: 'Invalid or missing reset token.' });
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        if (password.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'Failed to reset password' });
            } else {
                setSuccess(true);
                setMessage({ type: 'success', text: 'Password reset successfully!' });
                setTimeout(() => router.push('/login'), 2000);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen dark:bg-[#050505] bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md dark:bg-white/5 bg-white p-8 rounded-2xl border dark:border-white/10 border-gray-200 shadow-lg">
                <div className="text-center mb-8">
                    <Link href="/">
                        <Logo className="h-12 w-auto mx-auto mb-6 cursor-pointer" />
                    </Link>
                    <h1 className="text-2xl font-bold dark:text-white text-gray-900 mb-2">Reset Password</h1>
                    <p className="dark:text-gray-400 text-gray-600 text-sm">
                        Enter your new password below.
                    </p>
                </div>

                {!success ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-400 text-gray-700 mb-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full dark:bg-black/50 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg p-3 dark:text-white text-gray-900 focus:outline-none focus:border-amber-500"
                                placeholder="At least 6 characters"
                                required
                                disabled={!token}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium dark:text-gray-400 text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full dark:bg-black/50 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg p-3 dark:text-white text-gray-900 focus:outline-none focus:border-amber-500"
                                placeholder="Repeat your password"
                                required
                                disabled={!token}
                            />
                        </div>

                        {message.text && (
                            <div className={`p-3 rounded-lg text-sm ${message.type === 'error'
                                    ? 'dark:bg-red-500/10 bg-red-50 border dark:border-red-500/20 border-red-300 dark:text-red-400 text-red-700'
                                    : 'dark:bg-green-500/10 bg-green-50 border dark:border-green-500/20 border-green-300 dark:text-green-400 text-green-700'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !token}
                            className="w-full bg-amber-500 dark:hover:bg-amber-400 hover:bg-amber-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">✅</span>
                        </div>
                        <p className="dark:text-gray-300 text-gray-700 mb-2">
                            Password reset successfully!
                        </p>
                        <p className="dark:text-gray-500 text-gray-500 text-sm">
                            Redirecting to login...
                        </p>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <Link
                        href="/login"
                        className="dark:text-amber-500 text-amber-600 hover:underline text-sm"
                    >
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen dark:bg-[#050505] bg-gray-50 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full" />
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
