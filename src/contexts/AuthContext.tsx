import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const TIMESTAMP_KEY = 'auth_timestamp';
const TOKEN_EXPIRY_DAYS = 7;

interface User {
  id: string;
  full_name: string;
  phone: string;
  group_name: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if token is expired (older than 7 days)
  const isTokenExpired = (): boolean => {
    const timestamp = localStorage.getItem(TIMESTAMP_KEY);
    if (!timestamp) return true;

    const tokenDate = new Date(timestamp);
    const now = new Date();
    const daysDiff = (now.getTime() - tokenDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysDiff > TOKEN_EXPIRY_DAYS;
  };

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser && !isTokenExpired()) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        logout();
      }
    } else if (storedToken) {
      // Token exists but is expired
      logout();
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    // Store token, user, and timestamp
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    localStorage.setItem(TIMESTAMP_KEY, new Date().toISOString());

    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Clear all auth data
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TIMESTAMP_KEY);

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const checkAuth = (): boolean => {
    if (!token || !user) return false;
    if (isTokenExpired()) {
      logout();
      return false;
    }
    return true;
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isAdmin: user?.is_admin || false,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
