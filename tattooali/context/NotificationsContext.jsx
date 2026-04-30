import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';

const NotificationsContext = createContext(null);

const GET_ENDPOINTS = [
  '/api/notifications/me',
  '/api/mobile/notifications/me',
  '/api/notifications',
];

const READ_ALL_ENDPOINTS = [
  '/api/notifications/me/read-all',
  '/api/mobile/notifications/me/read-all',
  '/api/notifications/read-all',
];

const READ_ONE_ENDPOINTS = [
  (id) => `/api/notifications/${id}/read`,
  (id) => `/api/mobile/notifications/${id}/read`,
];

function mapNotification(raw, idx) {
  const id = raw?.id ?? raw?.notification_id ?? `${idx}-${raw?.created_at || Date.now()}`;
  const title = String(raw?.titulo || raw?.title || 'Notificação');
  const message = String(raw?.mensagem || raw?.message || '');
  const createdAt = raw?.created_at || raw?.data_criacao || new Date().toISOString();
  const isRead = Boolean(raw?.lida ?? raw?.read ?? false);
  const type = String(raw?.tipo || raw?.type || 'GENERAL');
  return {
    id: String(id),
    title,
    message,
    createdAt,
    isRead,
    type,
    payload: raw,
  };
}

export function NotificationsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setError(null);
      return [];
    }
    setLoading(true);
    setError(null);
    let lastErr = null;
    for (const endpoint of GET_ENDPOINTS) {
      try {
        const data = await api.get(endpoint);
        const rows = Array.isArray(data?.rows) ? data.rows : Array.isArray(data) ? data : [];
        const mapped = rows.map(mapNotification).sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setItems(mapped);
        return mapped;
      } catch (e) {
        lastErr = e;
      }
    }
    setItems([]);
    setError(lastErr?.message || 'Não foi possível carregar notificações.');
    return [];
  }, [isAuthenticated]);

  const markAllAsRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    for (const endpoint of READ_ALL_ENDPOINTS) {
      try {
        await api.put(endpoint, {});
        return true;
      } catch {
        // tenta próximo endpoint
      }
    }
    return false;
  }, []);

  const markOneAsRead = useCallback(async (id) => {
    setItems((prev) => prev.map((n) => (n.id === String(id) ? { ...n, isRead: true } : n)));
    for (const makeEndpoint of READ_ONE_ENDPOINTS) {
      try {
        await api.put(makeEndpoint(id), {});
        return true;
      } catch {
        // tenta próximo endpoint
      }
    }
    return false;
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const id = setInterval(() => {
      fetchNotifications();
    }, 45000);
    return () => clearInterval(id);
  }, [isAuthenticated, fetchNotifications]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isAuthenticated) {
        fetchNotifications();
      }
    });
    return () => sub.remove();
  }, [isAuthenticated, fetchNotifications]);

  const unreadCount = useMemo(
    () => items.reduce((acc, curr) => acc + (curr.isRead ? 0 : 1), 0),
    [items],
  );

  const value = useMemo(
    () => ({
      notifications: items,
      unreadCount,
      loading,
      error,
      refreshNotifications: fetchNotifications,
      markAllAsRead,
      markOneAsRead,
    }),
    [items, unreadCount, loading, error, fetchNotifications, markAllAsRead, markOneAsRead],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotifications deve ser usado dentro de NotificationsProvider');
  }
  return ctx;
}
