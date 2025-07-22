import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import apiService from '../services/api';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(true);

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const expiresAt = localStorage.getItem('token_expires_at');
      
      if (token && expiresAt) {
        // Check if token is expired
        const now = new Date();
        const expiry = new Date(expiresAt);
        
        if (now < expiry) {
          try {
            const response = await apiService.getCurrentUser();
            if (response.data?.user) {
              setCurrentUser(response.data.user);
              setIsAuthenticated(true);
            } else {
              // Invalid token, clear storage
              localStorage.removeItem('auth_token');
              localStorage.removeItem('token_expires_at');
            }
          } catch (error) {
            console.log('Token validation failed, user needs to login');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('token_expires_at');
          }
        } else {
          // Token expired, clear storage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('token_expires_at');
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleRegisterSuccess = (user: any) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token_expires_at');
    }
  };

  // Provide auth context to children
  const authContextValue = {
    user: currentUser,
    isAuthenticated,
    logout: handleLogout
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {authMode === 'login' ? (
          <LoginForm
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setAuthMode('register')}
          />
        ) : (
          <RegisterForm
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        )}
      </>
    );
  }

  // Clone children and pass auth context
  return (
    <>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { authContext: authContextValue } as any)
          : child
      )}
    </>
  );
};

export default AuthWrapper;