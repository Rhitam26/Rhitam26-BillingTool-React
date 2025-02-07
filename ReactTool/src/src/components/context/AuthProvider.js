import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: !!localStorage.getItem('access_token'),
    role: localStorage.getItem('role') || null,
  });

  const login = (token, role) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('role', role);
    setAuth({ isAuthenticated: true, role });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
    setAuth({ isAuthenticated: false, role: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
