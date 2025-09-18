// Authentication Context for React
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, isAuthenticated, isAuthenticatedButUnverified } from '../firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        // Load user data from localStorage or Firestore
        const storedUserData = localStorage.getItem('user');
        if (storedUserData) {
          try {
            const parsedUserData = JSON.parse(storedUserData);
            setUserData(parsedUserData);
          } catch (error) {
            console.error('Error parsing stored user data:', error);
          }
        }
        
        // Also ensure agent data is available in localStorage
        const storedAgentData = localStorage.getItem('agentData');
        if (storedAgentData) {
          try {
            const parsedAgentData = JSON.parse(storedAgentData);
            // Update userData with agent information
            setUserData(prev => ({
              ...prev,
              agent: parsedAgentData
            }));
          } catch (error) {
            console.error('Error parsing stored agent data:', error);
          }
        }
        
      } else {
        setUserData(null);
      }
    });

    return unsubscribe;
  }, []);


  const value = {
    user,
    userData,
    loading,
    isAuthenticated: isAuthenticated(),
    isAuthenticatedButUnverified: isAuthenticatedButUnverified()
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};