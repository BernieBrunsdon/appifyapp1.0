import React, { useState, useEffect } from 'react';
import unifiedAuthService from '../utils/unifiedAuthService';

/**
 * Professional Onboarding Component
 * Handles user registration and agent creation seamlessly
 */

const ProfessionalOnboarding = ({ onComplete, onError }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [agentData, setAgentData] = useState({
    agentName: '',
    agentVoice: 'alloy',
    firstMessage: '',
    company: '',
    websiteAddress: '',
    businessAddress: '',
    region: 'US',
    description: ''
  });

  // Initialize with Firebase auth
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check if user is already authenticated
      const isAuthenticated = await unifiedAuthService.initializeFromStorage();
      
      if (isAuthenticated) {
        const user = unifiedAuthService.getCurrentUser();
        setUser(user);
        
        // Check if user has an agent
        const agentResult = await unifiedAuthService.getAgent();
        if (agentResult.success && agentResult.agent) {
          // User already has an agent, skip onboarding
          onComplete(agentResult.agent);
          return;
        }
        
        // User authenticated but no agent, continue to agent creation
        setStep(2);
      } else {
        // No authentication, start with Firebase auth
        setStep(1);
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      onError(error.message);
    }
  };

  const handleFirebaseAuth = async (firebaseToken, userData) => {
    setLoading(true);
    try {
      console.log('🔐 Processing Firebase authentication...');
      
      const authResult = await unifiedAuthService.initializeWithFirebase(firebaseToken, userData);
      
      if (authResult.success) {
        setUser(authResult.user);
        setStep(2);
        console.log('✅ Firebase auth successful, proceeding to agent creation');
      } else {
        throw new Error(authResult.error);
      }
    } catch (error) {
      console.error('❌ Firebase auth error:', error);
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentCreation = async () => {
    setLoading(true);
    try {
      console.log('🤖 Creating professional agent...');
      
      // Validate required fields
      if (!agentData.agentName || !agentData.firstMessage) {
        throw new Error('Agent name and first message are required');
      }

      const agentResult = await unifiedAuthService.createAgent(agentData);
      
      if (agentResult.success) {
        console.log('✅ Agent created successfully:', agentResult.agent.id);
        onComplete(agentResult.agent);
      } else {
        throw new Error(agentResult.error);
      }
    } catch (error) {
      console.error('❌ Agent creation error:', error);
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setAgentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to Appify.AI</h1>
            <p className="text-gray-300">Professional AI Communication Platform</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => {
                // This would integrate with your Firebase auth
                // For demo purposes, we'll simulate it
                const mockFirebaseToken = 'mock_firebase_token_' + Date.now();
                const mockUserData = {
                  uid: 'demo_user_' + Date.now(),
                  email: 'demo@appifyai.com',
                  name: 'Demo User',
                  email_verified: true
                };
                handleFirebaseAuth(mockFirebaseToken, mockUserData);
              }}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Continue with Google'}
            </button>
            
            <div className="text-center text-gray-400 text-sm">
              Secure authentication powered by Firebase
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Your AI Assistant</h1>
            <p className="text-gray-300">Set up your professional AI assistant for voice calls and messaging</p>
          </div>
          
          <div className="space-y-6">
            {/* Agent Name */}
            <div>
              <label className="block text-white font-medium mb-2">Assistant Name</label>
              <input
                type="text"
                value={agentData.agentName}
                onChange={(e) => handleInputChange('agentName', e.target.value)}
                placeholder="e.g., Sarah, Customer Support Bot"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-white font-medium mb-2">Company Name</label>
              <input
                type="text"
                value={agentData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="e.g., Acme Corp"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Voice Selection */}
            <div>
              <label className="block text-white font-medium mb-2">Voice Type</label>
              <select
                value={agentData.agentVoice}
                onChange={(e) => handleInputChange('agentVoice', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="alloy">Alloy - Professional Female</option>
                <option value="echo">Echo - Professional Male</option>
                <option value="fable">Fable - Warm Female</option>
                <option value="onyx">Onyx - Deep Male</option>
                <option value="nova">Nova - Energetic Female</option>
                <option value="shimmer">Shimmer - Soft Female</option>
              </select>
            </div>

            {/* First Message */}
            <div>
              <label className="block text-white font-medium mb-2">First Message</label>
              <textarea
                value={agentData.firstMessage}
                onChange={(e) => handleInputChange('firstMessage', e.target.value)}
                placeholder="e.g., Hello! I'm Sarah from Acme Corp. How can I help you today?"
                rows="3"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white font-medium mb-2">Assistant Description</label>
              <textarea
                value={agentData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what your assistant should do and how it should behave..."
                rows="4"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                Back
              </button>
              <button
                onClick={handleAgentCreation}
                disabled={loading || !agentData.agentName || !agentData.firstMessage}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Assistant...' : 'Create Assistant'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ProfessionalOnboarding;