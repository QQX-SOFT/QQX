import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: string;
  email: string;
  role: string;
  tenant?: { subdomain: string };
};

type AuthContextType = {
  user: User | null;
  tenantSubdomain: string | null;
  isLoading: boolean;
  login: (userData: User, subdomain: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenantSubdomain, setTenantSubdomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedSubdomain = await AsyncStorage.getItem('tenant_subdomain');
      if (storedUser && storedSubdomain) {
        setUser(JSON.parse(storedUser));
        setTenantSubdomain(storedSubdomain);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User, subdomain: string) => {
    setUser(userData);
    setTenantSubdomain(subdomain);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    await AsyncStorage.setItem('tenant_subdomain', subdomain);
  };

  const logout = async () => {
    setUser(null);
    setTenantSubdomain(null);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('tenant_subdomain');
  };

  return (
    <AuthContext.Provider value={{ user, tenantSubdomain, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
