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

    const [unreadCount, setUnreadCount] = useState(0);

    // ... (visitor init) ...

    // Reset unread count when opening
    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
            scrollToBottom();
        }
    }, [isOpen]);

    // Poll for messages (even when closed)
    useEffect(() => {
        if (!visitorId) return;

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

                        // Calculate unread messages (if widget is closed)
                        if (!isOpen) {
                            const newReceivedMessages = newMessages.filter((m: Message) => m.sender === 'seller');
                            if (newReceivedMessages.length > 0) {
                                setUnreadCount(prevCount => prevCount + newReceivedMessages.length);
                            }
                        }

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
    }, [visitorId, domainId, lastPoll, isOpen]); // Added isOpen to deps to access current state

    // ... (sendMessage logic) ...

    return (
        <div className="fixed bottom-4 right-4 z-50 font-sans">
            {/* ... (Chat Window) ... */}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all hover:scale-105 ${isOpen
                    ? 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}

                {/* Unread Badge */}
                {!isOpen && unreadCount > 0 && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-[#0A0A0A]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                )}
            </button>
        </div>
    );
}
