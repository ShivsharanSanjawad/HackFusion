import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, mockUsers } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  ward?: string;
  department?: string;
  category?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('urbanflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const loggedInUser: User = {
          id: data.id || `user-${Date.now()}`,
          name: data.name || email.split('@')[0],
          email: data.email || email,
          role: data.role || role,
          phone: data.phone,
          ward: data.ward,
          department: data.department,
          createdAt: data.createdAt || new Date().toISOString(),
        };
        setUser(loggedInUser);
        localStorage.setItem('urbanflow_user', JSON.stringify(loggedInUser));
        localStorage.setItem('token', data.token || '');
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        const newUser: User = {
          id: responseData.id || `user-${Date.now()}`,
          name: responseData.name || data.name,
          email: responseData.email || data.email,
          role: responseData.role || data.role,
          phone: responseData.phone || data.phone,
          ward: responseData.ward || data.ward,
          department: responseData.department || data.department,
          createdAt: responseData.createdAt || new Date().toISOString(),
        };

        setUser(newUser);
        localStorage.setItem('urbanflow_user', JSON.stringify(newUser));
        localStorage.setItem('token', responseData.token || '');
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Signup error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('urbanflow_user');
  };

  const switchRole = (role: UserRole) => {
    const mockUser = mockUsers.find(u => u.role === role);
    if (mockUser && user) {
      const updatedUser = { ...mockUser, email: user.email };
      setUser(updatedUser);
      localStorage.setItem('urbanflow_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
