import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthContextType, AuthUser, LoginCredentials } from '../types';
import { apiService } from '../services/api';
import { setLocalStorage, getLocalStorage, removeLocalStorage } from '../lib/utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check for existing token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getLocalStorage('auth_token', null);
        if (token) {
          const authData = await apiService.refreshToken(token);
          setUser(authData.user);
          setLocalStorage('auth_token', authData.token);
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        removeLocalStorage('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      const authData = await apiService.login(credentials.email, credentials.password);
      
      setUser(authData.user);
      setLocalStorage('auth_token', authData.token);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    removeLocalStorage('auth_token');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
