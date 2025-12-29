
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  changePassword: (current: string, next: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'hm_admin_credentials';
const SESSION_KEY = 'hm_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Initialize Super Admin if not exists
  useEffect(() => {
    const storedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!storedAdmin) {
      const defaultAdmin = {
        email: 'admin@hostmaster.com',
        password: 'admin123',
        name: 'Super Admin',
        role: 'Admin',
        avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=4f46e5&color=fff'
      };
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(defaultAdmin));
    }

    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      setUser(JSON.parse(session));
    }
  }, []);

  const login = async (email: string, pass: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const storedAdmin = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) || '{}');
        
        if (email === storedAdmin.email && pass === storedAdmin.password) {
          const userData: User = {
            id: 'admin-1',
            name: storedAdmin.name,
            email: storedAdmin.email,
            role: 'Admin',
            avatar: storedAdmin.avatar
          };
          setUser(userData);
          localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
          resolve();
        } else {
          reject(new Error("Invalid credentials. Please check your email and password."));
        }
      }, 600);
    });
  };

  const signup = async (name: string, email: string, pass: string) => {
    // For this app, we only allow one Super Admin for now to maintain the "Master" structure
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const newUser = { name, email, password: pass, role: 'Admin', avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}` };
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(newUser));
        const userData = { id: Date.now().toString(), name, email, role: 'Admin' as const };
        setUser(userData);
        localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
        resolve();
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      
      // Also update the persistent master record
      const storedAdmin = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) || '{}');
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({ ...storedAdmin, ...data }));
    }
  };

  const changePassword = async (current: string, next: string) => {
    return new Promise<void>((resolve, reject) => {
      const storedAdmin = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) || '{}');
      if (current !== storedAdmin.password) {
        reject(new Error("Current password incorrect."));
        return;
      }
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({ ...storedAdmin, password: next }));
      resolve();
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
