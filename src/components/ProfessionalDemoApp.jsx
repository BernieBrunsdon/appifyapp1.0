import React, { useState, useEffect } from 'react';
import unifiedAuthService from '../utils/unifiedAuthService';
import ProfessionalOnboarding from './ProfessionalOnboarding';
import ProfessionalDashboard from './ProfessionalDashboard';

/**
 * Professional Demo App Component
 * Main component that orchestrates the entire demo experience
 */

const ProfessionalDemoApp = () => {
  const [user, setUser] = useState(null);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing Professional Demo App...');
      
      // Try to initialize from stored authentication
      const isAuthenticated = await unifiedAuthService.initializeFromStorage();
      
      if (isAuthenticated) {
        const currentUser = unifiedAuthService.getCurrentUser();
        setUser(currentUser);
        
        // Try to get user's agent
        const agentResult = await unifiedAuthService.getAgent();
        if (agentResult.success && agentResult.agent) {
          setAgent(agentResult.agent);
          console.log('✅ User and agent loaded from storage');
        } else {
          console.log('ℹ️ User authenticated but no agent found');
        }
      } else {
        console.log('ℹ️ No stored authentication found, starting fresh');
      }
      
    } catch (error) {
      console.error('❌ App initialization error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = (agentData) => {
    console.log('✅ Onboarding completed:', agentData);
    setAgent(agentData);
  };

  const handleOnboardingError = (errorMessage) => {
    console.error('❌ Onboarding error:', errorMessage);
    setError(errorMessage);
  };

  const handleLogout = () => {
    console.log('👋 User logging out...');
    unifiedAuthService.logout();
    setUser(null);
    setAgent(null);
    setError(null);
  };

  const handleFirebaseAuth = async (firebaseToken, userData) => {
    try {
      console.log('🔐 Processing Firebase authentication...');
      
      const authResult = await unifiedAuthService.initializeWithFirebase(firebaseToken, userData);
      
      if (authResult.success) {
        setUser(authResult.user);
        console.log('✅ Firebase authentication successful');
      } else {
        throw new Error(authResult.error);
      }
    } catch (error) {
      console.error('❌ Firebase authentication error:', error);
      setError(error.message);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <h1 className="text-3xl font-bold text-white mb-2">Appify.AI</h1>
          <p className="text-gray-300 text-lg">Professional AI Communication Platform</p>
          <p className="text-gray-400 text-sm mt-4">Initializing...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Demo Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              initializeApp();
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Onboarding state (no user or no agent)
  if (!user || !agent) {
    return (
      <ProfessionalOnboarding
        onComplete={handleOnboardingComplete}
        onError={handleOnboardingError}
      />
    );
  }

  // Main dashboard state
  return (
    <ProfessionalDashboard
      user={user}
      agent={agent}
      onLogout={handleLogout}
    />
  );
};

export default ProfessionalDemoApp;