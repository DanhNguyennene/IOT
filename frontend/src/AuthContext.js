import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from './api'; 
import { decodeToken } from './utils/jwtUtils';  // Function to decode JWT payload
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login function to call backend API
  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });

      const { access_token, refresh_token } = response.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      const decodedToken = decodeToken(access_token);
      if (!decodedToken || !decodedToken.user || !decodedToken.user.user_id) {
        throw new Error('Invalid token payload');
      }

      setUser({
        user_id: decodedToken.user.user_id,
        username: decodedToken.user.username
      });

      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login function to call backend API
  const loginWithFaceID = async (email) => {
    try {
      const response = await apiClient.post('/faceid/loginface', {
        email,
      });
      const { access_token, refresh_token } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      const decodedToken = decodeToken(access_token);
      console.log('Decoded Token:', decodedToken); // Debugging line
      if (!decodedToken || !decodedToken.user || !decodedToken.user.user_id) {
        throw new Error('Invalid token payload');
      }

      setUser({
        user_id: decodedToken.user.user_id,
        username: decodedToken.user.username
      });

      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout'); 
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = decodeToken(token);
      if (decodedToken && decodedToken.user && decodedToken.user.user_id) {
        setUser({
          user_id: decodedToken.user.user_id,
          username: decodedToken.user.username
        });
      }
    }
    setLoading(false);
  }, []);

  const value = {
    user,
    login,
    logout,
    loading,
    loginWithFaceID
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};