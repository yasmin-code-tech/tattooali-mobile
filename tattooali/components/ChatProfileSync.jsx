import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { ensureChatProfile, isSupabaseConfigured } from '../services/chatService';

const TOKEN_KEY = '@tattooali:token';

export default function ChatProfileSync() {
  const { user, isAuthenticated } = useAuth();
  const lastKey = useRef('');

  useEffect(() => {
    if (!isAuthenticated || !isSupabaseConfigured()) return;

    let cancelled = false;
    (async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (!token || cancelled) return;
        const me = await api.get('/api/user/me');
        if (cancelled || !me?.user_id) return;
        const key = `${me.user_id}:${me.nome || ''}:${me.sobrenome || ''}:${me.role || ''}`;
        if (key === lastKey.current) return;
        await ensureChatProfile(token, me);
        lastKey.current = key;
      } catch {
        /* offline ou schema ainda não criado */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.user_id, user?.nome, user?.sobrenome, user?.role]);

  return null;
}
