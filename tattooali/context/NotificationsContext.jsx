import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

function notificationSortKey(raw) {
  const value =
    raw?.createdAt ??
    raw?.created_at ??
    raw?.data_criacao ??
    raw?.updatedAt ??
    raw?.updated_at ??
    null;
  const ts = value ? new Date(value).getTime() : NaN;
  return Number.isFinite(ts) ? ts : 0;
}

function mapNotification(raw, idx) {
  const notificationId = raw?.notification_id ?? raw?.id;
  const id = String(notificationId ?? `${idx}-${raw?.tipo || 'n'}`);
  const title = String(raw?.titulo || raw?.title || 'Notificação');
  const message = String(raw?.mensagem || raw?.message || '');
  const sortTs = notificationSortKey(raw);
  const sortId = Number(notificationId) || 0;
  const createdAt =
    raw?.createdAt ??
    raw?.created_at ??
    raw?.data_criacao ??
    (sortTs > 0 ? new Date(sortTs).toISOString() : null);
  const isRead = Boolean(raw?.lida ?? raw?.read ?? false);
  const type = String(raw?.tipo || raw?.type || 'GENERAL');
  return {
    id,
    title,
    message,
    createdAt,
    isRead,
    type,
    sortTs,
    sortId,
    payload: raw,
  };
}

function sortNotifications(rows) {
  return [...rows]
    .sort((a, b) => {
      if (b.sortTs !== a.sortTs) return b.sortTs - a.sortTs;
      return b.sortId - a.sortId;
    })
    .map(({ sortTs, sortId, payload, ...rest }) => rest);
}

const POLL_MS = 10000;

export function NotificationsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const fetchSeqRef = useRef(0);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setError(null);
      return [];
    }

    const seq = ++fetchSeqRef.current;
    setError(null);
    let lastErr = null;

    for (const endpoint of GET_ENDPOINTS) {
      try {
        const data = await api.get(endpoint);
        if (seq !== fetchSeqRef.current) return [];
        const rows = Array.isArray(data?.rows) ? data.rows : Array.isArray(data) ? data : [];
        const mapped = sortNotifications(rows.map(mapNotification));
        setItems(mapped);
        return mapped;
      } catch (e) {
        lastErr = e;
      }
    }

    if (seq !== fetchSeqRef.current) return [];
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
    }, POLL_MS);
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
      error,
      refreshNotifications: fetchNotifications,
      markAllAsRead,
      markOneAsRead,
    }),
    [items, unreadCount, error, fetchNotifications, markAllAsRead, markOneAsRead],
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
