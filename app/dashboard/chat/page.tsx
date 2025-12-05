'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MessageCircle, Search, Send, Loader2, User, Clock, Check, CheckCheck, ArrowLeft, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatSession {
    id: string;
    domainName: string;
    visitorName: string;
    visitorEmail: string | null;
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

export default function ChatPage() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoadingSessions, setIsLoadingSessions] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch sessions
    const fetchSessions = async () => {
        try {
            const res = await fetch('/api/user/chat/sessions');
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

    // Keep messages ref updated for polling
    const messagesRef = useRef<Message[]>([]);
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // Fetch messages for selected session
    useEffect(() => {
        if (!selectedSessionId) return;

        // Optimistically mark as read in UI
        setSessions(prev => prev.map(s =>
            s.id === selectedSessionId ? { ...s, unreadCount: 0 } : s
        ));

        const fetchMessages = async () => {
            setIsLoadingMessages(true);
            try {
                const res = await fetch(`/api/user/chat/messages?sessionId=${selectedSessionId}&markRead=true`);
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

        // Poll for new messages in active session
        const interval = setInterval(async () => {
            try {
                // Get last message timestamp from ref to avoid stale closure
                const currentMessages = messagesRef.current;
                const lastMsg = currentMessages[currentMessages.length - 1];
                const after = lastMsg ? lastMsg.createdAt : null;

                const url = new URL('/api/user/chat/messages', window.location.origin);
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

                    // Only scroll if we actually added new messages
                    if (hasNew) {
                        scrollToBottom();
                    }
                }
            } catch (error) {
                console.error('Error polling messages:', error);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [selectedSessionId]);

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
            const res = await fetch('/api/user/chat/messages', {
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
                // Update session last message
                fetchSessions();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;

        try {
            const res = await fetch(`/api/user/chat/messages/${messageId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setMessages(prev => prev.filter(m => m.id !== messageId));
                // Update session last message if needed
                fetchSessions();
            } else {
                console.error('Failed to delete message');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this entire conversation? This cannot be undone.')) return;

        try {
            const res = await fetch(`/api/user/chat/sessions/${sessionId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setSessions(prev => prev.filter(s => s.id !== sessionId));
                if (selectedSessionId === sessionId) {
                    setSelectedSessionId(null);
                    setMessages([]);
                }
            } else {
                console.error('Failed to delete session');
            }
        } catch (error) {
            console.error('Error deleting session:', error);
        }
    };

    const selectedSession = sessions.find(s => s.id === selectedSessionId);

    return (
        <div className="fixed inset-0 z-50 flex bg-white dark:bg-[#0A0A0A]">
            {/* Sidebar */}
            <div className={`w-full md:w-80 border-r dark:border-white/5 border-gray-200 flex flex-col ${selectedSessionId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b dark:border-white/5 border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Link href="/dashboard" className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h2 className="font-bold text-lg">Messages</h2>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
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
                            <p>No messages yet</p>
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
                                    <h3 className="font-medium truncate pr-2">{session.visitorName || 'Visitor'}</h3>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {formatDistanceToNow(new Date(session.lastMessageAt), { addSuffix: true })}
                                    </span>
                                </div>
                                {session.domainName !== 'DomainLiq Support' && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-1 font-medium">{session.domainName}</p>
                                )}
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex-1 pr-2">
                                        {session.lastMessage}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {session.unreadCount > 0 && (
                                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                                {session.unreadCount}
                                            </span>
                                        )}
                                        <button
                                            onClick={(e) => handleDeleteSession(e, session.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            title="Delete conversation"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
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
                                    <h3 className="font-bold">{selectedSession?.visitorName || 'Visitor'}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span className="font-medium text-amber-600 dark:text-amber-400">
                                            {selectedSession?.domainName}
                                        </span>
                                        {selectedSession?.visitorEmail && selectedSession.visitorEmail !== 'support@domainliq.com' && (
                                            <>
                                                <span>•</span>
                                                <span>{selectedSession.visitorEmail}</span>
                                            </>
                                        )}
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
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === 'seller' ? 'justify-end' : 'justify-start'} group`}
                                    >
                                        <div className={`max-w-[85%] md:max-w-[70%] ${msg.sender === 'seller' ? 'order-1' : 'order-2'} flex items-end gap-2`}>
                                            <div>
                                                <div
                                                    className={`p-4 rounded-2xl text-sm shadow-sm ${msg.sender === 'seller'
                                                        ? 'bg-amber-500 text-white rounded-br-none'
                                                        : 'bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/5 rounded-bl-none'
                                                        }`}
                                                >
                                                    {msg.content}
                                                </div>
                                                <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${msg.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
                                                    <span>{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</span>
                                                    {msg.sender === 'seller' && (
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
                        <p className="text-lg">Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
