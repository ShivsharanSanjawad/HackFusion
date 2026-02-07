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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find mock user based on role
    const mockUser = mockUsers.find(u => u.role === role);
    if (mockUser) {
      const loggedInUser = { ...mockUser, email };
      setUser(loggedInUser);
      localStorage.setItem('urbanflow_user', JSON.stringify(loggedInUser));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone,
      ward: data.ward,
      department: data.department,
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    localStorage.setItem('urbanflow_user', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
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
