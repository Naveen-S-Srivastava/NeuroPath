import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : 'http://localhost:5000';

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('neuropath_user');
      const token = localStorage.getItem('neuropath_token');

      if (savedUser && token) {
        try {
          // Verify token with backend
          const response = await fetch(`${API_BASE}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('neuropath_user');
            localStorage.removeItem('neuropath_token');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('neuropath_user');
          localStorage.removeItem('neuropath_token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [API_BASE]);

  const login = async (email, password, role, promoCode = '') => {
    setIsLoading(true);

    try {
      console.log('Login attempt:', { email, role, promoCode }); // Debug log

      let response;
      try {
        response = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, role, promoCode }),
        });
      } catch (err) {
        setIsLoading(false);
        console.error('Login network error:', err);
        if (!navigator.onLine) {
          throw new Error('Network error: You appear to be offline');
        }
        throw new Error('Network error: Unable to reach authentication server');
      }

      let data = {};
      try {
        data = await response.json();
      } catch (err) {
        console.warn('Failed to parse response as JSON:', err);
        // non-json response
      }

      if (!response.ok) {
        setIsLoading(false);
        throw new Error((data && data.message) || `Login failed (${response.status})`);
      }

      setUser(data.user);
      localStorage.setItem('neuropath_user', JSON.stringify(data.user));
      localStorage.setItem('neuropath_token', data.token);
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signup = async (name, email, password, role) => {
    setIsLoading(true);

    try {
      let response;
      try {
        response = await fetch(`${API_BASE}/api/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password, role }),
        });
      } catch (err) {
        setIsLoading(false);
        console.error('Signup network error:', err);
        if (!navigator.onLine) {
          throw new Error('Network error: You appear to be offline');
        }
        throw new Error('Network error: Unable to reach authentication server');
      }

      let data = {};
      try {
        data = await response.json();
      } catch (err) {
        console.warn('Failed to parse signup response as JSON:', err);
        // non-json response
      }

      if (!response.ok) {
        setIsLoading(false);
        throw new Error((data && data.message) || `Signup failed (${response.status})`);
      }

      setUser(data.user);
      localStorage.setItem('neuropath_user', JSON.stringify(data.user));
      localStorage.setItem('neuropath_token', data.token);
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('neuropath_user');
    localStorage.removeItem('neuropath_token');
  };

  const updateUser = (userData, token) => {
    setUser(userData);
    localStorage.setItem('neuropath_user', JSON.stringify(userData));
    localStorage.setItem('neuropath_token', token);
  };

  const value = {
    user,
    login,
    logout,
    signup,
    updateUser,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
