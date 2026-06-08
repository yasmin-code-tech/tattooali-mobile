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
const READ_STATE_KEY = '@tattooali:chat_last_read';

async function loadSeenAtMap() {
  try {
    const raw = await AsyncStorage.getItem(READ_STATE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function persistSeenAtMap(map) {
  try {
    await AsyncStorage.setItem(READ_STATE_KEY, JSON.stringify(map));
  } catch {
    /* ignore storage errors */
  }
}

function resolveSeenTimestamp(conversationId, atIso, conversations, seenAtMap) {
  if (atIso) {
    const ts = new Date(atIso).getTime();
    if (Number.isFinite(ts)) return ts;
  }
  const current = conversations.find((c) => String(c.conversationId) === String(conversationId));
  if (current?.lastInteraction) {
    const ts = new Date(current.lastInteraction).getTime();
    if (Number.isFinite(ts)) return ts;
  }
  return Date.now();
}

function computeUnreadCount({
  conversationId,
  lastInteractionDate,
  inferredUnread,
  localUnread,
  seenAtMap,
}) {
  const lastInteractionTs = lastInteractionDate ? new Date(lastInteractionDate).getTime() : 0;
  const seenTs = Number(seenAtMap[String(conversationId)] || 0);
  if (Number.isFinite(lastInteractionTs) && lastInteractionTs > 0 && lastInteractionTs <= seenTs) {
    return 0;
  }
  const unseenByTime = Number.isFinite(lastInteractionTs) && lastInteractionTs > seenTs ? 1 : 0;
  return Math.max(inferredUnread, localUnread, unseenByTime);
}

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
  const seenAtLoadedRef = useRef(false);
  const conversationsRef = useRef([]);
  const activeConversationIdRef = useRef(null);

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
          return {
            id: String(r.peer_app_user_id),
            peerAppUserId: r.peer_app_user_id,
            name: r.peer_name || 'Usuário',
            avatar: '💬',
            isOnline: false,
            lastMessage: r.last_body || '',
            isLastMessageMine: String(r.last_sender_id ?? r.last_message_sender_id ?? r.last_sender ?? r.sender_id) === String(mySub),
            lastInteraction: lastInteractionDate,
            unreadCount: computeUnreadCount({
              conversationId,
              lastInteractionDate,
              inferredUnread,
              localUnread,
              seenAtMap: seenAtByConversationRef.current,
            }),
            conversationId: r.conversation_id,
          };
        });
      setConversations(mapped);
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
    if (!isAuthenticated) {
      seenAtByConversationRef.current = {};
      seenAtLoadedRef.current = false;
      return undefined;
    }
    let alive = true;
    loadSeenAtMap().then((map) => {
      if (!alive) return;
      seenAtByConversationRef.current = map;
      seenAtLoadedRef.current = true;
      refreshThreads();
    });
    return () => {
      alive = false;
    };
  }, [isAuthenticated, refreshThreads]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const id = setInterval(() => {
      refreshThreads();
    }, 8000);
    return () => clearInterval(id);
  }, [isAuthenticated, refreshThreads]);

  const markAsReadRef = useRef(() => {});

  const markAsRead = useCallback((conversationId, atIso) => {
    const currentConversations = conversationsRef.current;
    if (!conversationId) {
      activeConversationIdRef.current = null;
      const now = Date.now();
      const seenNext = { ...seenAtByConversationRef.current };
      for (const c of currentConversations) {
        const ts = new Date(c.lastInteraction).getTime();
        seenNext[String(c.conversationId)] = Number.isFinite(ts) ? ts : now;
      }
      seenAtByConversationRef.current = seenNext;
      persistSeenAtMap(seenNext);
      setLocalUnreadByConversation({});
      setConversations((prev) => prev.map((c) => ({ ...c, unreadCount: 0 })));
      return;
    }
    const key = String(conversationId);
    const seenTs = resolveSeenTimestamp(
      key,
      atIso,
      currentConversations,
      seenAtByConversationRef.current,
    );
    const seenNext = {
      ...seenAtByConversationRef.current,
      [key]: seenTs,
    };
    seenAtByConversationRef.current = seenNext;
    persistSeenAtMap(seenNext);
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

  markAsReadRef.current = markAsRead;

  const setActiveConversationId = useCallback((conversationId) => {
    activeConversationIdRef.current =
      conversationId != null && conversationId !== ''
        ? String(conversationId)
        : null;
  }, []);

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
              const convKey = String(conversationId);
              if (activeConversationIdRef.current === convKey) {
                markAsReadRef.current(conversationId, row.created_at);
              } else {
                setLocalUnreadByConversation((prev) => ({
                  ...prev,
                  [conversationId]: (prev[conversationId] || 0) + 1,
                }));
                setConversations((prev) =>
                  prev.map((c) =>
                    String(c.conversationId) === convKey
                      ? {
                          ...c,
                          unreadCount: (Number(c.unreadCount) || 0) + 1,
                          lastMessage: row.body || c.lastMessage,
                          lastInteraction: row.created_at
                            ? new Date(row.created_at)
                            : c.lastInteraction,
                          isLastMessageMine: false,
                        }
                      : c,
                  ),
                );
              }
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
      setActiveConversationId,
      isSupabaseReady: isSupabaseConfigured(),
    }),
    [conversations, totalUnreadCount, loading, error, refreshThreads, markAsRead, setActiveConversationId],
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
