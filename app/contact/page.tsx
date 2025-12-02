'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Send, CheckCircle } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to send message');
            }

            setSuccess(true);
            setFormData({ name: '', email: '', message: '' });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen dark:bg-[#050505] bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-4">Message Sent!</h1>
                    <p className="dark:text-gray-400 text-gray-600 mb-8">
                        Thank you for contacting us. We'll get back to you soon.
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 bg-amber-500 dark:hover:bg-amber-400 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen dark:bg-[#050505] bg-gray-50 dark:text-white text-gray-900 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <Link href="/">
                        <Logo className="h-10 w-auto mx-auto mb-6 cursor-pointer" />
                    </Link>
                    <h1 className="text-4xl font-bold mb-4 dark:text-white text-gray-900">Contact Us</h1>
                    <p className="dark:text-gray-400 text-gray-600">
                        Have a question or feedback? We'd love to hear from you.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="dark:bg-red-500/10 bg-red-50 border dark:border-red-500/20 border-red-300 dark:text-red-400 text-red-700 p-4 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg p-3 dark:text-white text-gray-900 dark:placeholder-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg p-3 dark:text-white text-gray-900 dark:placeholder-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                            Message
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            rows={6}
                            className="w-full dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-300 rounded-lg p-3 dark:text-white text-gray-900 dark:placeholder-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                            required
                            minLength={10}
                        />
                        <p className="dark:text-gray-500 text-gray-600 text-sm mt-1">Minimum 10 characters</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-amber-500 dark:hover:bg-amber-400 hover:bg-amber-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            'Sending...'
                        ) : (
                            <>
                                <Send className="h-5 w-5" />
                                Send Message
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
