import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('review_web_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const profile = await api.auth.getMe();
          setUser(profile);
        } catch (err) {
          console.error("Failed to restore session:", err);
          logout();
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  const handleAuthSuccess = (authResponse) => {
    localStorage.setItem('review_web_token', authResponse.token);
    setToken(authResponse.token);
    setUser(authResponse.user);
  };

  const loginWithGoogle = async (credential) => {
    setIsLoading(true);
    try {
      const resp = await api.auth.loginWithGoogle({ credential });
      handleAuthSuccess(resp);
      return resp.user;
    } finally {
      setIsLoading(false);
    }
  };

  // Supports local test/demo login when user has not yet configured Google Cloud API credentials
  const loginTestUser = async (email, name, picture) => {
    setIsLoading(true);
    try {
      const resp = await api.auth.loginWithGoogle({ email, name, picture });
      handleAuthSuccess(resp);
      return resp.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('review_web_token');
    setToken(null);
    setUser(null);
  };

  const deleteAccount = async () => {
    await api.auth.deleteAccount();
    logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: !!user?.is_staff,
        isModerator: !!user?.is_moderator || !!user?.is_staff,
        isLoading,
        loginWithGoogle,
        loginTestUser,
        logout,
        deleteAccount,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
