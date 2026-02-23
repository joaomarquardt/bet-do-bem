import { createContext, useContext, useState, useMemo, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '@/lib/api/client';
import { authService } from '@/lib/api/auth.service';
import { userService } from '@/lib/api/user.service';
import { User } from '@/lib/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, displayName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = '@betdobem_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Erro ao carregar usuário salvo:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const persistUser = useCallback(async (userData: User) => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await authService.login({ email: username, password });
      await apiClient.saveTokens({ accessToken: response.token });
      const me = await userService.getMe();
      await persistUser(me);
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  }, [persistUser]);

  const register = useCallback(async (username: string, displayName: string, password: string) => {
    try {
      await authService.register({
        username,
        password,
        name: displayName,
        email: `${username}`
      });

      await login(username, password);
    } catch (error) {
      console.error("Erro no registro:", error);
      throw error;
    }
  }, [login]);

  const logout = useCallback(async () => {
    await apiClient.clearTokens();
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback((newData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...newData };
      AsyncStorage.setItem(USER_KEY, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: !!user, login, register, logout, updateUser }),
    [user, isLoading, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
