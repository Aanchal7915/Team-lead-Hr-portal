import React, { createContext, useState, useEffect } from 'react';
import api, { authApi } from '../api/api.js';

const AuthContext = createContext(null);

// console.log("API Base URL:", import.meta.env.VITE_API_URL);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Prioritize HR Portal userInfo, fallback to main app 'user' state
      const userInfo = localStorage.getItem('userInfo') || localStorage.getItem('user');
      if (userInfo) {
        setUser(JSON.parse(userInfo));
      }
    } catch (error) {
      console.error("Failed to parse user info from localStorage", error);
      localStorage.removeItem('userInfo');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, role, deviceInfo) => {
    const url = role === 'hr' ? '/auth/login/hr' : '/auth/login/employee';

    // Prepare request body - include deviceInfo and isTouchDevice for employee logins
    const requestBody = { email, password };
    if (role === 'employee' && deviceInfo) {
      requestBody.deviceInfo = deviceInfo;
      // Detect if device has touch capability
      requestBody.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    // Use authApi for login
    const { data } = await authApi.post(url, requestBody);
    if (data) {
      const userData = { ...data, role };
      localStorage.setItem('userInfo', JSON.stringify(userData));
      setUser(userData);
    }
  };

  // --- NEW OTP REGISTRATION FUNCTIONS ---
  const requestRegistrationOtp = async (userData) => {
    // Use authApi for registration
    const { data } = await authApi.post('/auth/register/request-otp', userData);
    return data; // Return the success message
  };

  const registerHR = async ({ name, email, password }) => {
    // Use authApi for HR registration
    const { data } = await authApi.post('/auth/register-hr', { name, email, password });
    localStorage.setItem('userInfo', JSON.stringify({ ...data, role: 'hr' }));
    setUser({ ...data, role: 'hr' });
  };

  const verifyAndRegister = async (email, otp) => {
    // Use authApi for verification
    const { data } = await authApi.post('/auth/register/verify', { email, otp });
    if (data) {
      const newUserData = { ...data, role: 'employee' };
      localStorage.setItem('userInfo', JSON.stringify(newUserData));
      setUser(newUserData);
    }
  };

  // --- NEW OTP PASSWORD RESET FUNCTIONS ---
  const forgotPassword = async (email) => {
    // Use authApi for password reset
    const { data } = await authApi.post('/auth/forgotpassword', { email });
    return data;
  };

  const resetPassword = async (email, otp, password) => {
    // Use authApi for password reset
    const { data } = await authApi.put('/auth/resetpassword', { email, otp, password });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    requestRegistrationOtp, // New
    verifyAndRegister,      // New
    forgotPassword,         // Updated
    resetPassword,          // Updated
    isAuthenticated: !!user,
    loading,
    registerHR
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;


