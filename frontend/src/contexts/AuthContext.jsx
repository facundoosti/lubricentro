import React, { createContext, useContext, useState, useEffect } from 'react';
import authAPI from '@services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = authAPI.getCurrentUser();
        if (currentUser && authAPI.isAuthenticated()) {
          // Verificar token con el backend
          const isValid = await authAPI.verifyToken();
          if (isValid) {
            setUser(currentUser);
            setIsAuthenticated(true);
          } else {
            // Token inválido, limpiar
            authAPI.logout();
          }
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        authAPI.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    setLoading(true);
    const response = await authAPI.login(email, password);
    setUser(response.data.user);
    setIsAuthenticated(true);
    setLoading(false);
    return response;
  };

  // Logout
  const logout = () => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Actualizar usuario
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 