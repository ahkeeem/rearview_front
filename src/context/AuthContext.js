import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // Fallback to basic data if storage is missing but token is valid
          setUser({
            id: decoded.userId || decoded.id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role || 'user'
          });
        }
      } catch (err) {
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await api.users.login(credentials);
      
      // If OTP is required, don't set user yet
      if (response.pending_verification) {
        return response;
      }

      const { token, user: userData } = response;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return response;
    } catch (error) {
      setError(error.message || 'Login failed');
      throw error;
    }
  };

  const verifyOTP = async (userId, code) => {
    try {
      setError(null);
      const response = await api.users.confirmOTP(userId, code);
      const { token, user: userData } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return response;
    } catch (error) {
      setError(error.message || 'Verification failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.users.logout();
    } catch (err) {
      console.error('Logout failed on server');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
    }
  };

  const refreshUser = async () => {
    if (!user?.id) return;
    try {
      const userData = await api.users.getProfile(user.id);
      setUser(prev => ({ ...prev, ...userData }));
      localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  };

  const value = {
    user,
    login,
    verifyOTP,
    logout,
    refreshUser,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

export default AuthContext;