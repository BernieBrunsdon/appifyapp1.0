// Authentication Context for React
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, getCurrentUser, isAuthenticated } from '../firebase/auth';

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
      
      if (user) {
        console.log('🔍 AuthContext - User authenticated, loading data...');
        
        // Load user data from localStorage
        const storedUserData = localStorage.getItem('user');
        const storedAgentData = localStorage.getItem('agentData');
        
        let userData = null;
        let agentData = null;
        
        // Parse user data
        if (storedUserData) {
          try {
            userData = JSON.parse(storedUserData);
            console.log('✅ AuthContext - User data loaded:', userData);
          } catch (error) {
            console.error('❌ Error parsing stored user data:', error);
          }
        }
        
        // Parse agent data
        if (storedAgentData) {
          try {
            agentData = JSON.parse(storedAgentData);
            console.log('✅ AuthContext - Agent data loaded:', agentData);
          } catch (error) {
            console.error('❌ Error parsing stored agent data:', error);
          }
        }
        
        // Combine user and agent data
        if (userData && agentData) {
          const combinedData = {
            ...userData,
            agent: agentData
          };
          setUserData(combinedData);
          console.log('✅ AuthContext - Combined data set:', combinedData);
        } else if (userData) {
          setUserData(userData);
          console.log('✅ AuthContext - User data set (no agent):', userData);
        } else {
          console.log('⚠️ AuthContext - No user data found');
        }
        
        setLoading(false);
      } else {
        console.log('🔍 AuthContext - User not authenticated, clearing data');
        setUserData(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userData,
    loading,
    isAuthenticated: isAuthenticated()
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
