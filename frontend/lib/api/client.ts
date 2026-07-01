import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetch } from 'expo/fetch';
import { Alert, DeviceEventEmitter } from 'react-native';
import { ApiError, AuthTokens } from '@/lib/types';

const TOKEN_KEY = '@betdobem_tokens';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private isSessionExpired = false;
  private refreshSubscribers: ((token: string | null) => void)[] = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getTokens(): Promise<AuthTokens | null> {
    try {
      const data = await AsyncStorage.getItem(TOKEN_KEY);

      if (!data) return null;
      const parsed = JSON.parse(data);
      if (typeof parsed === 'string') {
        return { accessToken: parsed } as AuthTokens;
      }
      if (Array.isArray(parsed)) {
        const obj = parsed.find((p) => p && typeof p === 'object' && p.accessToken);
        if (obj) return obj as AuthTokens;
        return null;
      }
      return parsed as AuthTokens;
    } catch {
      return null;
    }
  }

  async saveTokens(tokens: AuthTokens): Promise<void> {
    this.isSessionExpired = false;
    await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  }

  async clearTokens(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(path, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    return url.toString();
  }

  private async buildHeaders(config?: RequestConfig): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...config?.headers,
    };

    if (!config?.skipAuth) {
      const tokens = await this.getTokens();
      if (tokens?.accessToken) {
        headers['Authorization'] = `Bearer ${tokens.accessToken}`;
      }
    }

    return headers;
  }

  private onRefreshed(token: string | null) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(cb: (token: string | null) => void) {
    this.refreshSubscribers.push(cb);
  }

  private async handleResponse<T>(response: Response, originalRequest?: { method: HttpMethod, path: string, body?: unknown, config?: RequestConfig }): Promise<T> {
    if (response.status === 401) {
      if (this.isSessionExpired) {
        throw { status: 401, message: 'Sessao expirada. Faca login novamente.' } as ApiError;
      }

      if (originalRequest && !originalRequest.path.includes('/auth/refresh') && !originalRequest.path.includes('/auth/login')) {
        
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          let newToken: string | null = null;
          
          try {
            const refreshUrl = this.buildUrl('/api/auth/refresh');
            const refreshResponse = await fetch(refreshUrl, {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });

            if (refreshResponse.ok) {
              const data = await refreshResponse.json();
              if (data && data.token) {
                await this.saveTokens({ accessToken: data.token });
                newToken = data.token;
              }
            }
          } catch (e) {
            console.error("Refresh token failed", e);
          }

          this.isRefreshing = false;

          if (newToken) {
            DeviceEventEmitter.emit('onSessionRefreshed');
            this.onRefreshed(newToken);
            return this.request<T>(originalRequest.method, originalRequest.path, originalRequest.body, originalRequest.config);
          } else {
            this.isSessionExpired = true;
            this.onRefreshed(null);
            await this.clearTokens();
            
            DeviceEventEmitter.emit('onSessionExpired');
            
            throw { status: 401, message: 'Sessao expirada. Faca login novamente.' } as ApiError;
          }
        } else {
          return new Promise<T>((resolve, reject) => {
            this.addRefreshSubscriber((token: string | null) => {
              if (token) {
                this.request<T>(originalRequest.method, originalRequest.path, originalRequest.body, originalRequest.config)
                  .then(resolve)
                  .catch(reject);
              } else {
                reject({ status: 401, message: 'Sessao expirada. Faca login novamente.' } as ApiError);
              }
            });
          });
        }
      }

      await this.clearTokens();
      throw { status: 401, message: 'Sessao expirada. Faca login novamente.' } as ApiError;
    }

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.message || errorBody.error || errorMessage;
      } catch {}
      throw { status: response.status, message: errorMessage } as ApiError;
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
      return undefined as T;
    }
    
    try {
      return JSON.parse(text) as T;
    } catch (e) {
      console.warn('Failed to parse JSON response', e);
      return undefined as T;
    }
  }

  private async request<T>(method: HttpMethod, path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    const url = this.buildUrl(path, config?.params);
    const headers = await this.buildHeaders(config);

    const response = await fetch(url, {
      method,
      headers,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response, { method, path, body, config });
  }

  async get<T>(path: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('GET', path, undefined, config);
  }

  async post<T>(path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', path, body, config);
  }

  async put<T>(path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', path, body, config);
  }

  async patch<T>(path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('PATCH', path, body, config);
  }

  async delete<T>(path: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', path, undefined, config);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
