'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser, AuthContextType, LoginRequest, RegisterRequest } from '@/types/auth';

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!accessToken;

  // API call helper
  const apiCall = async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add auth header if token exists
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  };

  // Login function
  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);

      const response = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success) {
        setUser(response.data.user);
        setAccessToken(response.data.accessToken);

        // Store access token in localStorage for persistence
        localStorage.setItem('accessToken', response.data.accessToken);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);

      const response = await apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.success) {
        // Registration successful, but don't auto-login
        // User needs to login manually after registration
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API to invalidate refresh token
      await apiCall('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear local state
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const response = await apiCall('/api/auth/refresh', {
        method: 'POST',
      });

      if (response.success) {
        setAccessToken(response.data.accessToken);
        localStorage.setItem('accessToken', response.data.accessToken);
        return response.data.accessToken;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (userData: Partial<AuthUser>) => {
    try {
      setIsLoading(true);

      const response = await apiCall('/api/auth/me', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });

      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get current user profile
  const getCurrentUser = async () => {
    try {
      const response = await apiCall('/api/auth/me');

      if (response.success) {
        setUser(response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Get current user error:', error);
      // If getting user fails, clear auth state
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      throw error;
    }
  };

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!accessToken) return;

    // Decode token to get expiry time
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;

      // Refresh token 1 minute before expiry
      const refreshTime = Math.max(timeUntilExpiry - 60000, 0);

      const timer = setTimeout(() => {
        refreshToken().catch(() => {
          // If refresh fails, user will be logged out
        });
      }, refreshTime);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  }, [accessToken]);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if access token exists in localStorage
        const storedToken = localStorage.getItem('accessToken');

        if (storedToken) {
          setAccessToken(storedToken);

          // Try to get current user
          await getCurrentUser();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid token
        localStorage.removeItem('accessToken');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Context value
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// HOC to protect routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      // Redirect to login page or show login form
      return <div>Please login to access this page</div>;
    }

    return <Component {...props} />;
  };
}
