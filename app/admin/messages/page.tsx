'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Mail, MailOpen, Trash2, Reply, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: string;
    read: boolean;
}

export default function MessagesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Redirect if not authenticated or not admin
    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/login');
            return;
        }

        // Check if user is admin (replace with your email)
        if (session.user?.email !== 'huldil@icloud.com') {
            router.push('/dashboard');
            return;
        }

        fetchMessages();
    }, [session, status, router]);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/contact/messages');
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const res = await fetch(`/api/contact/messages/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ read: true }),
            });

            if (res.ok) {
                setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m));
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const deleteMessage = async (id: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;

        try {
            const res = await fetch(`/api/contact/messages/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setMessages(messages.filter(m => m.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    };

    const startChat = async (email: string) => {
        try {
            const res = await fetch('/api/admin/chat/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok && data.sessionId) {
                router.push(`/admin/chat?sessionId=${data.sessionId}`);
            } else {
                alert(data.error || 'Failed to start chat');
            }
        } catch (error) {
            console.error('Failed to start chat:', error);
            alert('Failed to start chat');
        }
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
            </div>
        );
    }

    const unreadCount = messages.filter(m => !m.read).length;

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Contact Messages</h1>
                        <p className="text-gray-400 mt-1">
                            {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Link
                        href="/admin/pending-domains"
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 hover:text-white transition-all"
                    >
                        Back to Admin
                    </Link>
                </div>

                {messages.length === 0 ? (
                    <div className="text-center py-12 text-gray-600">
                        No messages yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`p-6 rounded-xl border transition-all ${msg.read
                                    ? 'bg-white/5 border-white/10'
                                    : 'bg-amber-500/10 border-amber-500/30'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {msg.read ? (
                                                <MailOpen className="h-5 w-5 text-gray-500" />
                                            ) : (
                                                <Mail className="h-5 w-5 text-amber-500" />
                                            )}
                                            <div>
                                                <h3 className="font-semibold text-white">{msg.name}</h3>
                                                <p className="text-sm text-gray-400">{msg.email}</p>
                                            </div>
                                        </div>
                                        <p className="text-gray-300 mt-4 whitespace-pre-wrap">{msg.message}</p>
                                        <p className="text-xs text-gray-500 mt-4">
                                            {new Date(msg.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => startChat(msg.email)}
                                            className="p-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 hover:text-amber-300 transition-all"
                                            title="Chat with User"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => window.location.href = `mailto:${msg.email}?subject=Re: Your message to DomainLiq&body=Hi ${msg.name},%0D%0A%0D%0ARegarding your message:%0D%0A> ${msg.message}%0D%0A%0D%0A`}
                                            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:text-blue-300 transition-all"
                                            title="Reply via Email"
                                        >
                                            <Reply className="h-4 w-4" />
                                        </button>
                                        {!msg.read && (
                                            <button
                                                onClick={() => markAsRead(msg.id)}
                                                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                                                title="Mark as read"
                                            >
                                                <MailOpen className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteMessage(msg.id)}
                                            className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
