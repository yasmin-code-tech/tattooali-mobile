import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { fetchChatThreads, isSupabaseConfigured } from '../services/chatService';
import { getJwtSub } from '../lib/jwtSub';
import { createSupabaseAuthed } from '../lib/supabaseClient';

const TOKEN_KEY = '@tattooali:token';

const ConversationsContext = createContext(null);

export function ConversationsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [localUnreadByConversation, setLocalUnreadByConversation] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const realtimeTimerRef = useRef(null);
  const realtimeUnsubRef = useRef(null);
  const mySubRef = useRef(null);

  function inferUnreadCount(row, mySub) {
    const direct =
      Number.isFinite(Number(row?.unread_count))
        ? Number(row.unread_count)
        : Number.isFinite(Number(row?.unread))
          ? Number(row.unread)
          : null;
    if (direct != null) return Math.max(0, direct);

    const lastSender =
      row?.last_sender_id ??
      row?.last_message_sender_id ??
      row?.last_sender ??
      row?.sender_id ??
      null;
    if (!lastSender || !mySub) return 0;
    return String(lastSender) === String(mySub) ? 0 : 1;
  }

  const refreshThreads = useCallback(async () => {
    if (!isAuthenticated || !isSupabaseConfigured()) {
      setConversations([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) {
        setConversations([]);
        return;
      }
      const mySub = getJwtSub(token);
      mySubRef.current = mySub;
      const rows = await fetchChatThreads(token);
      const mapped = rows
        .filter((r) => r.peer_app_user_id != null)
        .map((r) => ({
          id: String(r.peer_app_user_id),
          peerAppUserId: r.peer_app_user_id,
          name: r.peer_name || 'Usuário',
          avatar: '💬',
          isOnline: false,
          lastMessage: r.last_body || '',
          lastInteraction: r.last_at ? new Date(r.last_at) : new Date(0),
          unreadCount: Math.max(
            inferUnreadCount(r, mySub),
            localUnreadByConversation[r.conversation_id] || 0,
          ),
          conversationId: r.conversation_id,
        }));
      setConversations(mapped);
    } catch (e) {
      setError(e?.message || 'Falha ao carregar conversas');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, localUnreadByConversation]);

  useEffect(() => {
    refreshThreads();
  }, [refreshThreads]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const id = setInterval(() => {
      refreshThreads();
    }, 30000);
    return () => clearInterval(id);
  }, [isAuthenticated, refreshThreads]);

  useEffect(() => {
    let alive = true;
    async function setupRealtime() {
      if (!isAuthenticated || !isSupabaseConfigured()) return;
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token || !alive) return;
      const supabase = createSupabaseAuthed(token);
      const channel = supabase
        .channel('threads:badge')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages' },
          (payload) => {
            const row = payload?.new || {};
            const conversationId = row.conversation_id;
            const senderId = row.sender_id;
            if (
              conversationId != null &&
              senderId &&
              mySubRef.current &&
              String(senderId) !== String(mySubRef.current)
            ) {
              setLocalUnreadByConversation((prev) => ({
                ...prev,
                [conversationId]: (prev[conversationId] || 0) + 1,
              }));
            }
            if (realtimeTimerRef.current) clearTimeout(realtimeTimerRef.current);
            realtimeTimerRef.current = setTimeout(() => {
              refreshThreads();
            }, 350);
          },
        )
        .subscribe();
      realtimeUnsubRef.current = () => {
        supabase.removeChannel(channel);
      };
    }
    setupRealtime();
    return () => {
      alive = false;
      if (realtimeTimerRef.current) clearTimeout(realtimeTimerRef.current);
      if (realtimeUnsubRef.current) realtimeUnsubRef.current();
      realtimeUnsubRef.current = null;
    };
  }, [isAuthenticated, refreshThreads]);

  const markAsRead = useCallback((conversationId) => {
    if (!conversationId) {
      setLocalUnreadByConversation({});
      setConversations((prev) => prev.map((c) => ({ ...c, unreadCount: 0 })));
      return;
    }
    setLocalUnreadByConversation((prev) => {
      if (!(conversationId in prev)) return prev;
      const next = { ...prev };
      delete next[conversationId];
      return next;
    });
    setConversations((prev) =>
      prev.map((c) =>
        String(c.conversationId) === String(conversationId)
          ? { ...c, unreadCount: 0 }
          : c,
      ),
    );
  }, []);
  const totalUnreadCount = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0),
    [conversations],
  );

  const value = useMemo(
    () => ({
      conversations,
      totalUnreadCount,
      loading,
      error,
      refreshThreads,
      markAsRead,
      isSupabaseReady: isSupabaseConfigured(),
    }),
    [conversations, totalUnreadCount, loading, error, refreshThreads, markAsRead],
  );

  return (
    <ConversationsContext.Provider value={value}>{children}</ConversationsContext.Provider>
  );
}

export function useConversations() {
  const ctx = useContext(ConversationsContext);
  if (!ctx) {
    throw new Error('useConversations deve ser usado dentro de <ConversationsProvider>');
  }
  return ctx;
}
