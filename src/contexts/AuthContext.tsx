import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  isLoading: boolean; // Add this
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add this

  useEffect(() => {
    console.log('🔍 Checking localStorage on mount...');
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    const timestamp = localStorage.getItem(TIMESTAMP_KEY);
    
    console.log('Token:', storedToken);
    console.log('User:', storedUser);
    console.log('Timestamp:', timestamp);

    if (storedToken && storedUser) {
      // Check if token is expired
      let isExpired = true;
      if (timestamp) {
        const tokenDate = new Date(timestamp);
        const now = new Date();
        const daysDiff = (now.getTime() - tokenDate.getTime()) / (1000 * 60 * 60 * 24);
        isExpired = daysDiff > TOKEN_EXPIRY_DAYS;
      }

      if (!isExpired) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log('✅ Auth restored from localStorage');
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(TIMESTAMP_KEY);
        }
      } else {
        console.log('❌ Token expired, clearing localStorage');
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TIMESTAMP_KEY);
      }
    }
    
    setIsLoading(false); // Done checking
    console.log('✅ Auth check complete');
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    localStorage.setItem(TIMESTAMP_KEY, new Date().toISOString());
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TIMESTAMP_KEY);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const checkAuth = (): boolean => {
    if (!token || !user) return false;
    
    const timestamp = localStorage.getItem(TIMESTAMP_KEY);
    if (!timestamp) return false;
    
    const tokenDate = new Date(timestamp);
    const now = new Date();
    const daysDiff = (now.getTime() - tokenDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > TOKEN_EXPIRY_DAYS) {
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
    isLoading, // Add this
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