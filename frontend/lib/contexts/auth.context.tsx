import { createContext, useContext, useState, useMemo, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '@/lib/api';
import { MOCK_CURRENT_USER } from '@/lib/mocks/data';
import { User } from '@/lib/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, displayName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = '@betdobem_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(USER_KEY).then((data) => {
      if (data) {
        try { setUser(JSON.parse(data)); } catch {}
      }
      setIsLoading(false);
    });
  }, []);

  const persistUser = useCallback(async (userData: User) => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const login = useCallback(async (username: string, _password: string) => {
    // TODO: Replace with authService.login({ username, password })
    // const response = await authService.login({ username, password });
    // await apiClient.saveTokens(response.tokens);
    // await persistUser(response.user);
    const userData = { ...MOCK_CURRENT_USER, username, displayName: username };
    await persistUser(userData);
  }, [persistUser]);

  const register = useCallback(async (username: string, displayName: string, _password: string) => {
    // TODO: Replace with authService.register({ username, displayName, password })
    // const response = await authService.register({ username, displayName, password });
    // await apiClient.saveTokens(response.tokens);
    // await persistUser(response.user);
    const userData = { ...MOCK_CURRENT_USER, username, displayName, wins: 0, losses: 0, draws: 0 };
    await persistUser(userData);
  }, [persistUser]);

  const logout = useCallback(async () => {
    // TODO: Replace with authService.logout()
    await apiClient.clearTokens();
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: !!user, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
