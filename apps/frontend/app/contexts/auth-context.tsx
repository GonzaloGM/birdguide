import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User } from '@birdguide/shared-types';
import { sessionService, Session } from '../services/session.service';

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Check for existing session on mount
    const session = sessionService.getSession();
    if (session) {
      setUser(session.user);
      setIsLoggedIn(true);
    }
  }, []);

  const login = (userData: User, token: string): void => {
    sessionService.saveSession(userData, token);
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = (): void => {
    sessionService.clearSession();
    setUser(null);
    setIsLoggedIn(false);
  };

  const value: AuthContextType = {
    user,
    isLoggedIn,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
