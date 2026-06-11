import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    if (token && username) {
      setUser({ username, token, role });
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    if (res.data.code === 'SUCCESS') {
      const { token, role } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      if (role) localStorage.setItem('role', role);
      setUser({ username, token, role: role || 'USER' });
      return { success: true, role: role || 'USER' };
    }
    return { success: false };
  }, []);

  const register = useCallback(async (username, password) => {
    const res = await api.post('/auth/register', { username, password, role: 'USER' });
    return res.data.code === 'SUCCESS';
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
