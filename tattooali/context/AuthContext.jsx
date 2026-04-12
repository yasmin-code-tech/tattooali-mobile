import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api';

const AuthContext = createContext(null);

const TOKEN_KEY = '@tattooali:token';
const USER_KEY = '@tattooali:user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function hydrate() {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        const userJson = await AsyncStorage.getItem(USER_KEY);
        if (token) {
          setIsAuthenticated(true);
          const parsed =
            userJson && userJson.trim()
              ? JSON.parse(userJson)
              : { email: '' };
          let next = { ...parsed };
          try {
            const me = await api.get('/api/user/me');
            Object.assign(next, me);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(next));
          } catch {
            // rede ou token inválido: mantém cache local
          }
          setUser(next);
        } else {
          await AsyncStorage.removeItem(USER_KEY);
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    hydrate();
  }, []);

  const persistSession = useCallback(async (token, userPayload) => {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [USER_KEY, JSON.stringify(userPayload)],
    ]);
    setUser(userPayload);
    setIsAuthenticated(true);
  }, []);

  const clearSession = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch {
      // ignora
    }
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) return null;
      const me = await api.get('/api/user/me');
      const prevJson = await AsyncStorage.getItem(USER_KEY);
      const base =
        prevJson && prevJson.trim() ? JSON.parse(prevJson) : {};
      const next = { ...base, ...me };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(next));
      setUser(next);
      return next;
    } catch {
      return null;
    }
  }, []);

  async function login(email, password) {
    const data = await api.post('/api/user/login', {
      email: String(email).trim().toLowerCase(),
      senha: password,
    });

    const jwt =
      data?.token ||
      data?.accessToken ||
      data?.jwt ||
      data?.data?.token;

    if (!jwt) {
      throw new Error('Token não retornado pelo servidor.');
    }

    const payload = {
      email: String(email).trim().toLowerCase(),
      ...(data?.user && typeof data.user === 'object' ? data.user : {}),
    };

    let profile = { ...payload };
    await persistSession(jwt, profile);
    try {
      const me = await api.get('/api/user/me');
      profile = { ...profile, ...me };
      await persistSession(jwt, profile);
    } catch {
      // agenda e outras telas ainda funcionam com email no payload
    }
    return profile;
  }

  async function register({ nome, sobrenome, cpf, email, senha, role, telefone }) {
    const body = {
      nome: nome.trim(),
      sobrenome: sobrenome.trim(),
      cpf: String(cpf).replace(/\D/g, ''),
      email: String(email).trim().toLowerCase(),
      senha,
      role: role === 'tatuador' ? 'tatuador' : 'cliente',
    };
    if (telefone) {
      const tel = String(telefone).replace(/\D/g, '');
      if (tel.length >= 9) body.telefone = tel;
    }

    return api.post('/api/user/register', body);
  }

  async function logout() {
    await clearSession();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
