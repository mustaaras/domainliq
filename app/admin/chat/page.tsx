
'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { MessageCircle, Search, Send, Loader2, ArrowLeft, Trash2, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatSession {
    id: string;
    userName: string;
    userEmail: string;
    userSubdomain: string;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
}

interface Message {
    id: string;
    sender: 'visitor' | 'seller';
    content: string;
    createdAt: string;
    read: boolean;
}

function AdminChatContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialSessionId = searchParams.get('sessionId');

    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(initialSessionId);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoadingSessions, setIsLoadingSessions] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesRef = useRef<Message[]>([]);

    // Fetch sessions
    const fetchSessions = async () => {
        try {
            const res = await fetch('/api/admin/chat/sessions');
            const data = await res.json();
            if (data.sessions) {
                setSessions(data.sessions);
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setIsLoadingSessions(false);
        }
    };

    useEffect(() => {
        fetchSessions();
        const interval = setInterval(fetchSessions, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    // Update selected session if URL param changes
    useEffect(() => {
        if (initialSessionId) {
            setSelectedSessionId(initialSessionId);
        }
    }, [initialSessionId]);

    // Keep messages ref updated
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // Fetch messages for selected session
    useEffect(() => {
        if (!selectedSessionId) return;

        // Update URL without refresh
        router.replace(`/admin/chat?sessionId=${selectedSessionId}`, { scroll: false });

        const fetchMessages = async () => {
            setIsLoadingMessages(true);
            try {
                const res = await fetch(`/api/admin/chat/messages?sessionId=${selectedSessionId}&markRead=true`);
                const data = await res.json();
                if (data.messages) {
                    setMessages(data.messages);
                    scrollToBottom();
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setIsLoadingMessages(false);
            }
        };

        fetchMessages();

        // Poll for new messages
        const interval = setInterval(async () => {
            try {
                const currentMessages = messagesRef.current;
                const lastMsg = currentMessages[currentMessages.length - 1];
                const after = lastMsg ? lastMsg.createdAt : null;

                const url = new URL('/api/admin/chat/messages', window.location.origin);
                url.searchParams.append('sessionId', selectedSessionId);
                url.searchParams.append('markRead', 'true');
                if (after) url.searchParams.append('after', after);

                const res = await fetch(url.toString());
                const data = await res.json();

                if (data.messages && data.messages.length > 0) {
                    let hasNew = false;
                    setMessages(prev => {
                        const existingIds = new Set(prev.map(m => m.id));
                        const newMessages = data.messages.filter((m: Message) => !existingIds.has(m.id));
                        if (newMessages.length === 0) return prev;
                        hasNew = true;
                        return [...prev, ...newMessages];
                    });

                    if (hasNew) {
                        scrollToBottom();
                    }
                }
            } catch (error) {
                console.error('Error polling messages:', error);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [selectedSessionId, router]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedSessionId) return;

        setIsSending(true);
        try {
            const res = await fetch('/api/admin/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: selectedSessionId,
                    content: newMessage,
                }),
            });

            const data = await res.json();

            if (data.message) {
                setMessages(prev => [...prev, data.message]);
                setNewMessage('');
                scrollToBottom();
                fetchSessions();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const selectedSession = sessions.find(s => s.id === selectedSessionId);

    // Filter out messages to ensure no duplication key issues if things go wrong
    const uniqueMessages = Array.from(new Map(messages.map(m => [m.id, m])).values())
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());


    return (
        <div className="fixed inset-0 z-50 flex bg-white dark:bg-[#0A0A0A]">
            {/* Sidebar */}
            <div className={`w-full md:w-80 border-r dark:border-white/5 border-gray-200 flex flex-col ${selectedSessionId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b dark:border-white/5 border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Link href="/admin/messages" className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h2 className="font-bold text-lg">Admin Chat</h2>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full bg-gray-100 dark:bg-white/5 border-0 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-amber-500/50"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {isLoadingSessions ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center p-8 text-gray-500">
                            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No active chats</p>
                        </div>
                    ) : (
                        sessions.map(session => (
                            <div
                                key={session.id}
                                className={`w-full p-4 text-left border-b dark:border-white/5 border-gray-100 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group relative ${selectedSessionId === session.id ? 'bg-amber-50 dark:bg-amber-500/10 border-l-4 border-l-amber-500' : ''
                                    }`}
                                onClick={() => setSelectedSessionId(session.id)}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-medium truncate pr-2">{session.userName}</h3>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {formatDistanceToNow(new Date(session.lastMessageAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-xs text-amber-600 dark:text-amber-400 mb-1 font-medium">{session.userEmail}</p>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex-1 pr-2">
                                        {session.lastMessage}
                                    </p>
                                    {session.unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            {session.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-gray-50 dark:bg-black/20 ${!selectedSessionId ? 'hidden md:flex' : 'flex'}`}>
                {selectedSessionId ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white dark:bg-[#0A0A0A] border-b dark:border-white/5 border-gray-200 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedSessionId(null)}
                                    className="md:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                                <div>
                                    <h3 className="font-bold">{selectedSession?.userName || 'User'}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span className="text-sm text-gray-400">
                                            {selectedSession?.userEmail}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {isLoadingMessages ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                                </div>
                            ) : (
                                uniqueMessages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === 'visitor' ? 'justify-end' : 'justify-start'} group`}
                                    >
                                        <div className={`max-w-[85%] md:max-w-[70%] ${msg.sender === 'visitor' ? 'order-1' : 'order-2'} flex items-end gap-2`}>
                                            <div>
                                                <div
                                                    className={`p-4 rounded-2xl text-sm shadow-sm ${msg.sender === 'visitor'
                                                        ? 'bg-amber-500 text-white rounded-br-none'
                                                        : 'bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/5 rounded-bl-none'
                                                        }`}
                                                >
                                                    {msg.content}
                                                </div>
                                                <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${msg.sender === 'visitor' ? 'justify-end' : 'justify-start'}`}>
                                                    <span>{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</span>
                                                    {msg.sender === 'visitor' && (
                                                        msg.read ? <CheckCheck className="h-3 w-3 text-amber-500" /> : <Check className="h-3 w-3" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white dark:bg-[#0A0A0A] border-t dark:border-white/5 border-gray-200">
                            <form onSubmit={handleSendMessage} className="flex gap-4 max-w-4xl mx-auto">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a reply..."
                                    className="flex-1 bg-gray-100 dark:bg-white/5 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500/50 dark:text-white"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || isSending}
                                    className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                                >
                                    {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                    <span className="hidden md:inline">Send</span>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageCircle className="h-16 w-16 mb-4 opacity-20" />
                        <p className="text-lg">Select a user to chat</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminChatPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>}>
            <AdminChatContent />
        </Suspense>
    );
}
