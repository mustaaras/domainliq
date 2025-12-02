'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        console.log('Attempting login for:', email);

        try {
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), 15000)
            );

            // Race between signIn and timeout
            const result = await Promise.race([
                signIn('credentials', {
                    email,
                    password,
                    redirect: false,
                }),
                timeoutPromise
            ]) as any;

            console.log('Login result:', result);

            if (result?.error) {
                console.error('Login error:', result.error);
                setError('Invalid email or password');
                setIsLoading(false);
            } else {
                console.log('Login successful, redirecting...');
                router.push('/dashboard');
                router.refresh();
            }
        } catch (error: any) {
            console.error('Login exception:', error);
            setError(error.message || 'An error occurred during login. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen dark:bg-[#050505] bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md dark:bg-white/5 bg-white p-8 rounded-2xl border dark:border-white/10 border-gray-200 shadow-lg">
                <div className="flex justify-center mb-6">
                    <Link href="/">
                        <img src="/logo.svg" alt="DomainLiq" className="h-8 w-auto cursor-pointer dark:bg-transparent bg-black rounded p-1" />
                    </Link>
                </div>
                <h1 className="text-2xl font-bold dark:text-white text-gray-900 mb-6 text-center">Login to DomainLiq</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium dark:text-gray-400 text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full dark:bg-black/50 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg p-3 dark:text-white text-gray-900 dark:placeholder-gray-600 placeholder-gray-400 focus:outline-none focus:border-amber-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium dark:text-gray-400 text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full dark:bg-black/50 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg p-3 dark:text-white text-gray-900 dark:placeholder-gray-600 placeholder-gray-400 focus:outline-none focus:border-amber-500"
                            required
                        />
                    </div>
                    {error && (
                        <div className="dark:bg-red-500/10 bg-red-50 border dark:border-red-500/20 border-red-300 dark:text-red-400 text-red-700 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-amber-500 dark:hover:bg-amber-400 hover:bg-amber-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
