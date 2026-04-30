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
  const localUnreadRef = useRef({});
  const seenAtByConversationRef = useRef({});
  const conversationsRef = useRef([]);

  useEffect(() => {
    localUnreadRef.current = localUnreadByConversation;
  }, [localUnreadByConversation]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

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
        .map((r) => {
          const conversationId = String(r.conversation_id);
          const inferredUnread = Math.max(0, inferUnreadCount(r, mySub));
          const localUnread = Math.max(0, Number(localUnreadRef.current[conversationId] || 0));
          const lastInteractionDate = r.last_at ? new Date(r.last_at) : new Date(0);
          const lastInteractionTs = lastInteractionDate.getTime();
          const seenTs = Number(seenAtByConversationRef.current[conversationId] || 0);
          const unseenByTime = Number.isFinite(lastInteractionTs) && lastInteractionTs > seenTs ? 1 : 0;
          return {
            id: String(r.peer_app_user_id),
            peerAppUserId: r.peer_app_user_id,
            name: r.peer_name || 'Usuário',
            avatar: '💬',
            isOnline: false,
            lastMessage: r.last_body || '',
            isLastMessageMine: String(r.last_sender_id ?? r.last_message_sender_id ?? r.last_sender ?? r.sender_id) === String(mySub),
            lastInteraction: lastInteractionDate,
            unreadCount: Math.max(inferredUnread, localUnread, unseenByTime),
            conversationId: r.conversation_id,
          };
        });
      setConversations((prev) => {
        const prevByConversation = new Map(prev.map((item) => [String(item.conversationId), item]));
        return mapped.map((item) => {
          const prevItem = prevByConversation.get(String(item.conversationId));
          if (!prevItem) return item;
          return {
            ...item,
            unreadCount: Math.max(Number(item.unreadCount) || 0, Number(prevItem.unreadCount) || 0),
          };
        });
      });
    } catch (e) {
      setError(e?.message || 'Falha ao carregar conversas');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshThreads();
  }, [refreshThreads]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const id = setInterval(() => {
      refreshThreads();
    }, 8000);
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
    const currentConversations = conversationsRef.current;
    if (!conversationId) {
      const now = Date.now();
      const seenNext = { ...seenAtByConversationRef.current };
      for (const c of currentConversations) {
        const ts = new Date(c.lastInteraction).getTime();
        seenNext[String(c.conversationId)] = Number.isFinite(ts) ? ts : now;
      }
      seenAtByConversationRef.current = seenNext;
      setLocalUnreadByConversation({});
      setConversations((prev) => prev.map((c) => ({ ...c, unreadCount: 0 })));
      return;
    }
    const key = String(conversationId);
    const current = currentConversations.find((c) => String(c.conversationId) === key);
    const seenTs = current ? new Date(current.lastInteraction).getTime() : Date.now();
    seenAtByConversationRef.current = {
      ...seenAtByConversationRef.current,
      [key]: Number.isFinite(seenTs) ? seenTs : Date.now(),
    };
    setLocalUnreadByConversation((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setConversations((prev) =>
      prev.map((c) =>
        String(c.conversationId) === key
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
