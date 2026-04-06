'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  EllipsisHorizontalIcon,
  PhoneIcon,
  VideoCameraIcon,
  CheckIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/context/auth';
import {
  messagingApi,
  Conversation,
  Message,
} from '@/lib/api';

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConvo = conversations.find((c) => c.id === selectedConvoId) || null;

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const data = await messagingApi.listConversations();
      setConversations(data);
      if (!selectedConvoId && data.length > 0) {
        setSelectedConvoId(data[0].id);
      }
    } catch {
      // silent
    } finally {
      setLoadingConvos(false);
    }
  }, [selectedConvoId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!selectedConvoId) return;
    setLoadingMessages(true);
    messagingApi
      .getMessages(selectedConvoId, { limit: 100 })
      .then((res) => {
        setMessages(res.data);
        // Mark as read
        messagingApi.markAsRead(selectedConvoId).catch(() => {});
        // Update unread count locally
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConvoId ? { ...c, unreadCount: 0 } : c,
          ),
        );
      })
      .catch(() => {})
      .finally(() => setLoadingMessages(false));
  }, [selectedConvoId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages every 5 seconds (fallback for WebSocket)
  useEffect(() => {
    if (!selectedConvoId) return;
    const interval = setInterval(async () => {
      try {
        const res = await messagingApi.getMessages(selectedConvoId, { limit: 100 });
        setMessages(res.data);
      } catch {
        // silent
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedConvoId]);

  const handleSend = async () => {
    if (!message.trim() || !selectedConvoId || sending) return;
    setSending(true);
    try {
      const newMsg = await messagingApi.sendMessage(selectedConvoId, {
        content: message.trim(),
      });
      setMessages((prev) => [...prev, newMsg]);
      setMessage('');
      // Update conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConvoId
            ? {
                ...c,
                lastMessage: {
                  id: newMsg.id,
                  content: newMsg.content,
                  senderId: newMsg.senderId,
                  isRead: false,
                  createdAt: newMsg.createdAt,
                },
                lastMessageAt: newMsg.createdAt,
              }
            : c,
        ),
      );
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      !searchQuery ||
      c.participant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.gig?.title?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const formatMessageTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-[calc(100dvh-10rem)] sm:h-[calc(100vh-12rem)] flex bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden">
      {/* Conversation List */}
      <div className={`${selectedConvoId ? 'hidden sm:flex' : 'flex'} w-full sm:w-80 border-r border-gray-100 flex-col sm:shrink-0`}>
        <div className="p-3 sm:p-4 border-b border-gray-100">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">Messages</h2>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvos ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              {searchQuery ? 'No matching conversations' : 'No conversations yet'}
            </div>
          ) : (
            filteredConversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setSelectedConvoId(convo.id)}
                className={`w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors text-left ${
                  selectedConvoId === convo.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="relative shrink-0">
                  {convo.participant?.avatar ? (
                    <img
                      src={convo.participant.avatar.includes('cloudinary.com') ? convo.participant.avatar.replace('/upload/', '/upload/w_80,h_80,c_fill,g_face,f_auto,q_auto/') : convo.participant.avatar}
                      alt={convo.participant.name || ''}
                      className="w-10 h-10 rounded-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        selectedConvoId === convo.id
                          ? 'bg-primary-200 text-primary-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {convo.participant?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-gray-800 truncate">
                        {convo.participant?.name || 'Unknown'}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {convo.lastMessageAt ? formatTime(convo.lastMessageAt) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {convo.lastMessage?.content || 'No messages yet'}
                  </p>
                  {convo.gig && (
                    <p className="text-[10px] text-primary-500 truncate mt-0.5">
                      {convo.gig.title}
                    </p>
                  )}
                </div>
                {convo.unreadCount > 0 && (
                  <span className="shrink-0 w-5 h-5 bg-primary-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {convo.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedConvoId ? 'flex' : 'hidden sm:flex'} flex-1 flex-col min-w-0`}>
        {!selectedConvo ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a conversation to start chatting
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setSelectedConvoId(null)}
                  className="sm:hidden p-1.5 -ml-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-600"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                </button>
                <div className="relative">
                  {selectedConvo.participant?.avatar ? (
                    <img
                      src={selectedConvo.participant.avatar.includes('cloudinary.com') ? selectedConvo.participant.avatar.replace('/upload/', '/upload/w_72,h_72,c_fill,g_face,f_auto,q_auto/') : selectedConvo.participant.avatar}
                      alt={selectedConvo.participant.name || ''}
                      className="w-9 h-9 rounded-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-600">
                      {selectedConvo.participant?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {selectedConvo.participant?.name || 'Unknown'}
                    </h3>
                  </div>
                  {selectedConvo.gig && (
                    <p className="text-xs text-gray-400">{selectedConvo.gig.title}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                  <PhoneIcon className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                  <VideoCameraIcon className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                  <EllipsisHorizontalIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          isMe
                            ? 'bg-primary-600 text-white rounded-2xl rounded-br-md'
                            : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md'
                        } px-4 py-3`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <div
                          className={`flex items-center gap-1 mt-1 ${
                            isMe ? 'justify-end' : ''
                          }`}
                        >
                          <span
                            className={`text-[10px] ${
                              isMe ? 'text-primary-200' : 'text-gray-400'
                            }`}
                          >
                            {formatMessageTime(msg.createdAt)}
                          </span>
                          {isMe && msg.isRead && (
                            <CheckIcon className="w-3 h-3 text-primary-200" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-100">
              <div className="flex items-end gap-2 sm:gap-3">
                <div className="hidden sm:flex gap-1">
                  <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                    <PaperClipIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                    <PhotoIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  className={`p-3 rounded-xl transition-colors ${
                    message.trim() && !sending
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
