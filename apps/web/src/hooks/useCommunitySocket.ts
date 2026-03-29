'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '@/lib/api';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

interface CommunitySocketEvents {
  onNewPost?: (post: any) => void;
  onPostUpdated?: (post: any) => void;
  onPostDeleted?: (data: { postId: string }) => void;
  onNewComment?: (data: { postId: string; comment: any }) => void;
  onLikeUpdated?: (data: { postId: string; likeCount: number }) => void;
  onCommentCountUpdated?: (data: { postId: string; commentCount: number }) => void;
  onCommentLikeUpdated?: (data: { commentId: string; likeCount: number }) => void;
  onUserTyping?: (data: { postId: string; userId: string }) => void;
}

export function useCommunitySocket(
  enabled: boolean,
  handlers: CommunitySocketEvents,
) {
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!enabled) return;

    const token = getAccessToken();
    if (!token) return;

    const socket = io(`${WS_URL}/community`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on('new_post', (data) => handlersRef.current.onNewPost?.(data));
    socket.on('post_updated', (data) => handlersRef.current.onPostUpdated?.(data));
    socket.on('post_deleted', (data) => handlersRef.current.onPostDeleted?.(data));
    socket.on('new_comment', (data) => handlersRef.current.onNewComment?.(data));
    socket.on('like_updated', (data) => handlersRef.current.onLikeUpdated?.(data));
    socket.on('comment_count_updated', (data) => handlersRef.current.onCommentCountUpdated?.(data));
    socket.on('comment_like_updated', (data) => handlersRef.current.onCommentLikeUpdated?.(data));
    socket.on('user_typing', (data) => handlersRef.current.onUserTyping?.(data));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled]);

  const joinPost = useCallback((postId: string) => {
    socketRef.current?.emit('join_post', { postId });
  }, []);

  const leavePost = useCallback((postId: string) => {
    socketRef.current?.emit('leave_post', { postId });
  }, []);

  const emitTyping = useCallback((postId: string) => {
    socketRef.current?.emit('typing_comment', { postId });
  }, []);

  return { joinPost, leavePost, emitTyping, socket: socketRef };
}
