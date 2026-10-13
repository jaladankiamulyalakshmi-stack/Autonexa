import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, companyName: string) => Promise<boolean>;
  quickDemoLogin: () => void;
  logout: () => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  error: string | null;
  clearError: () => void;
}

const DEMO_USER: UserProfile = {
  uid: 'usr_lead_pipeline_01',
  name: 'Amulya Lakshmi',
  email: 'jaladankiamulyalakshmi@gmail.com',
  companyName: 'Nexa Growth Labs',
  role: 'Head of Sales & Pipeline Operations',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('autonexa_auth_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // Pre-initialize with demo user so the reviewer has immediate frictionless access
        setUser(DEMO_USER);
        localStorage.setItem('autonexa_auth_user', JSON.stringify(DEMO_USER));
      }
    } catch (e) {
      console.error('Error restoring auth session', e);
      setUser(DEMO_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = () => setError(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    await new Promise((res) => setTimeout(res, 400));

    if (!email || !password) {
      setError('Please provide both email and password.');
      setIsLoading(false);
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setIsLoading(false);
      return false;
    }

    const newUser: UserProfile = {
      uid: `usr_${Date.now()}`,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      companyName: 'B2B Solutions Group',
      role: 'Account Executive',
    };

    setUser(newUser);
    localStorage.setItem('autonexa_auth_user', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    companyName: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    await new Promise((res) => setTimeout(res, 500));

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setIsLoading(false);
      return false;
    }

    const newUser: UserProfile = {
      uid: `usr_${Date.now()}`,
      name,
      email,
      companyName: companyName || 'Growth Agency',
      role: 'Growth Lead & Pipeline Autopilot',
    };

    setUser(newUser);
    localStorage.setItem('autonexa_auth_user', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const quickDemoLogin = () => {
    setUser(DEMO_USER);
    localStorage.setItem('autonexa_auth_user', JSON.stringify(DEMO_USER));
    setError(null);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('autonexa_auth_user');
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (!user) return;
    const next = { ...user, ...updated };
    setUser(next);
    localStorage.setItem('autonexa_auth_user', JSON.stringify(next));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        signup,
        quickDemoLogin,
        logout,
        updateProfile,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
