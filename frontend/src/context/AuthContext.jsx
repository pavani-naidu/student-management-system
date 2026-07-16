import { createContext, useContext, useState } from 'react';
import apiClient from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('sms_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const persistSession = (data) => {
    localStorage.setItem('sms_token', data.token);
    const userData = {
      userId: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
    };
    localStorage.setItem('sms_user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email, password, rememberMe) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password, rememberMe });
      persistSession(res.data.data);
      return res.data.data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password, role) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/register', { fullName, email, password, role });
      persistSession(res.data.data);
      return res.data.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('sms_token');
    localStorage.removeItem('sms_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
