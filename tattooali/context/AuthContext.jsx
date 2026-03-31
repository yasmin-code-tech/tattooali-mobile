import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

const STORAGE_KEY = '@tattoali:user';
const TOKEN_KEY = '@tattoali:token';

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoredUser() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setUser(JSON.parse(stored));
      } catch {
        // ignora erros de leitura
      } finally {
        setLoading(false);
      }
    }
    loadStoredUser();
  }, []);

  async function login(email, password) {
    // Modo mockado para desenvolvimento
    if (email === 'yasmin.jobs33@gmail.com' && password === '123456') {
      const userData = {
        id: 1, // Mock id
        email,
        token: 'mock-token-123456',
      };

      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        await AsyncStorage.setItem(TOKEN_KEY, userData.token);
      } catch {
        // ignora erros de escrita
      }

      setUser(userData);
      return userData;
    }

    const API_BASE_URL = 'http://10.50.83.61:3000/api';

    try {
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.message || 'E-mail ou senha incorretos.');
      }

      const userData = {
        id: data.id || 1, // Adicionar id
        email,
        token: data.token,
      };

      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        await AsyncStorage.setItem(TOKEN_KEY, data.token);
      } catch {
        // ignora erros de escrita
      }

      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error(error.message || 'Erro ao fazer login.');
    }
  }

  async function logout() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignora erros de remoção
    }
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
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