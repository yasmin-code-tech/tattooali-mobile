import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { fetchChatThreads, isSupabaseConfigured } from '../services/chatService';

const TOKEN_KEY = '@tattooali:token';

const ConversationsContext = createContext(null);

export function ConversationsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
          unreadCount: 0,
          conversationId: r.conversation_id,
        }));
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

  const markAsRead = useCallback(() => {}, []);

  const value = useMemo(
    () => ({
      conversations,
      loading,
      error,
      refreshThreads,
      markAsRead,
      isSupabaseReady: isSupabaseConfigured(),
    }),
    [conversations, loading, error, refreshThreads, markAsRead],
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
