import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

const MOCK_USERS = [
  { id: '1', name: 'Yasmin Oliveira', email: 'yasmin.jobs33@gmail.com', password: '123456' },
];

const STORAGE_KEY = '@tattoali:user';

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
    const found = MOCK_USERS.find(
      u => u.email === email && u.password === password
    );

    if (!found) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const { password: _, ...safeUser } = found;

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
    } catch {
      // ignora erros de escrita
    }

    setUser(safeUser);
    return safeUser;
  }

  async function logout() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
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