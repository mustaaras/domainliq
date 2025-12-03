'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, User } from 'lucide-react';

interface ChatWidgetProps {
    domainId: string;
    sellerName: string;
}

interface Message {
    id: string;
    sender: 'visitor' | 'seller';
    content: string;
    createdAt: string;
}

export function ChatWidget({ domainId, sellerName }: ChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [visitorId, setVisitorId] = useState('');
    const [lastPoll, setLastPoll] = useState<string | null>(null);
    const [sellerLastSeen, setSellerLastSeen] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize visitor ID
    useEffect(() => {
        let vid = localStorage.getItem('domainliq_visitor_id');
        if (!vid) {
            vid = Math.random().toString(36).substring(2) + Date.now().toString(36);
            localStorage.setItem('domainliq_visitor_id', vid);
        }
        setVisitorId(vid);
    }, []);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Poll for messages
    useEffect(() => {
        if (!isOpen || !visitorId) return;

        const pollMessages = async () => {
            try {
                const url = new URL('/api/chat/poll', window.location.origin);
                url.searchParams.append('domainId', domainId);
                url.searchParams.append('visitorId', visitorId);
                if (lastPoll) {
                    url.searchParams.append('after', lastPoll);
                }

                const res = await fetch(url.toString());
                const data = await res.json();

                if (data.sellerLastSeen) {
                    setSellerLastSeen(data.sellerLastSeen);
                }

                if (data.messages && data.messages.length > 0) {
                    setMessages(prev => {
                        const existingIds = new Set(prev.map(m => m.id));
                        const newMessages = data.messages.filter((m: Message) => !existingIds.has(m.id));
                        if (newMessages.length === 0) return prev;

                        // Update last poll time
                        const lastMsg = newMessages[newMessages.length - 1];
                        setLastPoll(lastMsg.createdAt);

                        return [...prev, ...newMessages];
                    });
                }
            } catch (error) {
                console.error('Error polling messages:', error);
            }
        };

        // Initial fetch
        pollMessages();

        // Poll interval
        const interval = setInterval(pollMessages, 3000);
        return () => clearInterval(interval);
    }, [isOpen, visitorId, domainId, lastPoll]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !visitorId) return;

        const tempMessage: Message = {
            id: 'temp-' + Date.now(),
            sender: 'visitor',
            content: newMessage,
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domainId,
                    visitorId,
                    content: tempMessage.content,
                }),
            });

            const data = await res.json();

            if (data.message) {
                setMessages(prev => prev.map(m => m.id === tempMessage.id ? data.message : m));
                setLastPoll(data.message.createdAt);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // TODO: Show error state
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 font-sans">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl w-[350px] h-[500px] mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
                    {/* Header */}
                    <div className="p-4 bg-amber-500 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Chat with Seller</h3>
                                <p className="text-xs text-white/80">
                                    {sellerLastSeen && new Date(sellerLastSeen).getTime() > Date.now() - 5 * 60 * 1000
                                        ? 'Online now'
                                        : sellerLastSeen
                                            ? `Last seen ${new Date(sellerLastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                            : 'Typically replies within a few hours'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-black/20">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 text-sm mt-8">
                                <p>👋 Hi there! How can we help you with this domain?</p>
                            </div>
                        )}
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'visitor' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'visitor'
                                        ? 'bg-amber-500 text-white rounded-br-none'
                                        : 'bg-white dark:bg-white/10 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/5 rounded-bl-none'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-white/10">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-gray-100 dark:bg-white/5 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500/50 dark:text-white"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || isLoading}
                                className="p-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all hover:scale-105 ${isOpen
                    ? 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
            </button>
        </div>
    );
}
