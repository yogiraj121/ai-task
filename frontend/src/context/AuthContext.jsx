import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    company: null,
    loading: true,
    isAuthenticated: false,
    onboardingComplete: false
  });
  const navigate = useNavigate();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      console.log('Checking auth status...', { token, userData });
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          console.log('Found user in localStorage:', user);
          
          setAuth({
            user,
            company: null,
            isAuthenticated: true,
            loading: false,
            onboardingComplete: true
          });
          
          console.log('Auth state updated to authenticated');
          
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          setAuth({
            user: null,
            company: null,
            isAuthenticated: false,
            loading: false,
            onboardingComplete: false
          });
        }
      } else {
        console.log('No valid auth data found');
        setAuth({
          user: null,
          company: null,
          isAuthenticated: false,
          loading: false,
          onboardingComplete: false
        });
      }
    };

    checkAuth();
  }, [navigate]);

  // Login function with mock data for development
  const login = async (email, password) => {
    try {
      console.log('Login attempt with:', { email });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, you would make an API call here:
      // const response = await api.post('/auth/login', { email, password });
      
      // For now, use mock data
      const mockUser = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        email: email || 'test@example.com',
        name: email ? email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) : 'Test User',
        role: email === 'admin@example.com' ? 'admin' : 'user'
      };
      
      // Set mock token and user data
      const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substr(2);
      
      // Save to localStorage
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      // Update auth state
      const authState = {
        user: mockUser,
        company: null,
        isAuthenticated: true,
        loading: false,
        onboardingComplete: true
      };
      
      // Update auth state
      setAuth(authState);
      
      console.log('Login successful, updated auth state:', authState);
      
      // Return success response
      return { 
        success: true, 
        user: mockUser,
        token: mockToken
      };
      
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please check your credentials and try again.' 
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Try to call logout on the server if the endpoint exists
      try {
        await api.post('/auth/logout');
      } catch (error) {
        console.warn('Logout endpoint not available, proceeding with client-side logout');
      }
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('company');
      
      // Update state
      setAuth({
        user: null,
        company: null,
        isAuthenticated: false,
        loading: false,
        onboardingComplete: false
      });
      
      // Redirect to login
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setAuth(prev => ({
      ...prev,
      user: { ...prev.user, ...userData }
    }));
  };

  // Update company data
  const updateCompany = (companyData) => {
    const updatedCompany = { ...auth.company, ...companyData };
    const onboardingComplete = !!updatedCompany.plan;
    
    setAuth(prev => ({
      ...prev,
      company: updatedCompany,
      onboardingComplete
    }));

    // Redirect based on onboarding status
    if (onboardingComplete) {
      navigate('/dashboard');
    } else if (auth.company) {
      navigate('/company-info');
    } else {
      navigate('/onboarding');
    }
  };

  // Complete onboarding
  const completeOnboarding = (userData, companyData) => {
    setAuth(prev => ({
      ...prev,
      user: { ...prev.user, ...userData },
      company: { ...prev.company, ...companyData },
      onboardingComplete: true
    }));
    navigate('/dashboard');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        ...auth, 
        login, 
        logout, 
        updateUser, 
        updateCompany,
        completeOnboarding
      }}
    >
      {!auth.loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
export default AuthContext;
