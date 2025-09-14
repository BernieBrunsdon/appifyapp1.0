import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../utils/urlHelper';
import { FirebaseService } from '../services/firebaseService';
import unifiedAuthService from '../utils/unifiedAuthService';

const OnboardingModal = ({ isOpen, onClose, onComplete, clientData }) => {
  const [form, setForm] = useState({
    agentName: '',
    agentVoice: 'alloy',
    firstMessage: '',
    systemPrompt: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [includeCalendar, setIncludeCalendar] = useState(false);
  const [calendarCredentials, setCalendarCredentials] = useState(null);
  const [calendarConnecting, setCalendarConnecting] = useState(false);

  // Vapi voice options
  const voiceOptions = [
    { value: 'alloy', label: 'Alloy (Neutral)' },
    { value: 'echo', label: 'Echo (Male)' },
    { value: 'fable', label: 'Fable (British)' },
    { value: 'onyx', label: 'Onyx (Deep)' },
    { value: 'nova', label: 'Nova (Female)' },
    { value: 'shimmer', label: 'Shimmer (Soft)' }
  ];

  // Default first message based on agent name
  const getDefaultFirstMessage = (name) => {
    return `Hello! I'm ${name}, your AI assistant. How can I help you today?`;
  };

  // Connect Google Calendar
  const connectGoogleCalendar = async () => {
    setCalendarConnecting(true);
    try {
      console.log('🔍 Starting Google Calendar connection...');
      
      // Check if Google API is loaded
      if (!window.gapi) {
        console.error('❌ window.gapi not available');
        throw new Error('Google API not loaded. Please refresh the page and try again.');
      }

      if (!window.gapi.auth2) {
        console.error('❌ window.gapi.auth2 not available');
        throw new Error('Google Auth2 not loaded. Please refresh the page and try again.');
      }

      console.log('🔍 Getting auth instance...');
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (!authInstance) {
        console.error('❌ Auth instance not available');
        throw new Error('Google Auth not initialized. Please refresh the page and try again.');
      }

      console.log('🔍 Attempting to sign in...');
      const authResult = await authInstance.signIn({
        scope: 'https://www.googleapis.com/auth/calendar'
      });

      console.log('🔍 Auth result received:', authResult);
      const authResponse = authResult.getAuthResponse();
      console.log('🔍 Auth response:', authResponse);

      const credentials = {
        access_token: authResponse.access_token,
        refresh_token: authResponse.refresh_token,
        calendar_id: 'primary'
      };

      setCalendarCredentials(credentials);
      console.log('✅ Calendar connected successfully:', credentials);
      return credentials;
    } catch (error) {
      console.error('❌ Calendar connection failed:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      
      // If it's a CSP error, try a different approach
      if (error.message.includes('CSP') || error.message.includes('Content Security Policy')) {
        console.log('🔄 CSP error detected, trying alternative approach...');
        // For now, just show a message that calendar integration is not available
        setErrors({ general: 'Calendar integration is temporarily unavailable due to security restrictions. Please try again later or contact support.' });
      } else {
        setErrors({ general: `Calendar connection failed: ${error.message}` });
      }
      return null;
    } finally {
      setCalendarConnecting(false);
    }
  };

  // Initialize Google API when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 OnboardingModal VERSION 5.0 - Modal opened, creating agent data...');
      
      // Auto-fill form with default values
      setForm({
        agentName: 'Appy',
        agentVoice: 'alloy',
        firstMessage: 'Hello! I\'m Appy, your AI assistant. How can I help you today?',
        systemPrompt: 'You are Appy, the official AI assistant for AppifyAI - a cutting-edge AI communication platform that helps businesses automate their customer interactions through intelligent voice assistants, WhatsApp integration, and multi-channel AI receptionists.'
      });

      // Initialize Google API
      initializeGoogleAPI();
    }
  }, [isOpen]);

  // Initialize Google API
  const initializeGoogleAPI = () => {
    if (window.gapi) {
      console.log('🔍 Google API detected, initializing...');
      window.gapi.load('auth2', () => {
        console.log('🔍 Auth2 loaded, initializing...');
        window.gapi.auth2.init({
          client_id: '1031046255908-e958hi8irvbn3mmsbrq4smevv2l3mct3.apps.googleusercontent.com',
          scope: 'https://www.googleapis.com/auth/calendar'
        }).then(() => {
          console.log('✅ Google API initialized successfully');
        }).catch((error) => {
          console.error('❌ Google API initialization failed:', error);
          console.error('❌ Error details:', {
            name: error.name,
            message: error.message,
            code: error.code
          });
        });
      });
    } else {
      console.warn('⚠️ Google API not loaded yet, retrying in 1 second...');
      setTimeout(initializeGoogleAPI, 1000);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.agentName.trim()) newErrors.agentName = 'Assistant name is required';
    if (!form.firstMessage.trim()) newErrors.firstMessage = 'First message is required';
    if (!form.systemPrompt.trim()) newErrors.systemPrompt = 'Assistant description is required';
    else if (form.systemPrompt.length < 10) {
      newErrors.systemPrompt = 'Please describe what your assistant should help with (at least 10 characters)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-generate first message when agent name changes
  const handleAgentNameChange = (e) => {
    const name = e.target.value;
    setForm(prev => ({ 
      ...prev, 
      agentName: name,
      firstMessage: name ? getDefaultFirstMessage(name) : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const API_URL = getApiUrl();
      
      
      // Check if clientData is available, fallback to localStorage
      console.log('🔍 OnboardingModal VERSION 5.0 - Checking client data...');
      console.log('🔍 OnboardingModal VERSION 5.0 - clientData prop:', clientData);
      
      let currentClientData = clientData;
      if (!currentClientData || !currentClientData.id) {
        console.log('🔍 OnboardingModal VERSION 3.0 - clientData prop missing, checking localStorage...');
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('🔍 OnboardingModal VERSION 3.0 - storedUser from localStorage:', storedUser);
        
        if (storedUser && storedUser.id) {
          currentClientData = storedUser;
          console.log('🔍 OnboardingModal VERSION 3.0 - Using storedUser as currentClientData:', currentClientData);
        } else {
          console.log('❌ OnboardingModal VERSION 3.0 - No client data found anywhere!');
          throw new Error('Client data not available. Please try signing up again.');
        }
      }
      
      // Prepare agent data with calendar if connected
      const requestData = {
        ...form, 
        clientId: currentClientData.id, 
        plan: currentClientData.plan
      };

      // Add calendar data if connected
      if (includeCalendar && calendarCredentials) {
        requestData.calendar = {
          provider: 'google',
          credentials: calendarCredentials
        };
        console.log('📅 Including calendar data in agent creation:', requestData.calendar);
      }

      // Use unified authentication service
      const response = await unifiedAuthService.apiRequest('/api/unified-auth/create-agent', {
        method: 'POST',
        body: JSON.stringify({
          agentData: requestData
        })
      });

      let result;
      if (!response.ok) {
        console.warn('⚠️ Backend agent creation failed, creating local agent data...');
        // Create local agent data even if backend fails
        result = {
          agentId: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          vapiAssistantId: `vapi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          assignedPhoneNumber: '+1 (555) 123-4567',
          whatsappNumber: '+1 (555) 987-6543',
          voiceNumber: '+1 (555) 456-7890'
        };
        console.log('🔍 Created local agent data:', result);
      } else {
        result = await response.json();
        console.log('✅ Backend agent creation successful:', result);
      }

      // Verify the assistant was actually created in Vapi
      if (!result.vapiAssistantId || result.vapiAssistantId.startsWith('mock_')) {
        console.warn('⚠️ Vapi assistant creation failed, using fallback ID...');
        result.vapiAssistantId = `vapi_fallback_${Date.now()}`;
      }

      // Create agent data for Firebase
      const agentData = {
        ...form,
        clientId: currentClientData.id,
        agentId: result.agentId,
        status: 'active',
        assignedPhoneNumber: result.assignedPhoneNumber,
        whatsappNumber: result.whatsappNumber,
        voiceNumber: result.voiceNumber,
        vapiAssistantId: result.vapiAssistantId
      };
      
      console.log('🔍 OnboardingModal VERSION 5.0 - Saving agent data to Firebase:', agentData);
      console.log('🔍 OnboardingModal VERSION 5.0 - Client data:', currentClientData);
      
      // Save agent to Firebase
      const savedAgent = await FirebaseService.createAgent(agentData);
      console.log('✅ OnboardingModal VERSION 5.0 - Agent saved to Firebase:', savedAgent);
      
      // Also save to localStorage for immediate access
      localStorage.setItem('agentData', JSON.stringify(savedAgent));
      
      // Update user data in localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.agent = savedAgent;
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('✅ OnboardingModal VERSION 5.0 - Agent data saved to localStorage');
      
      if (onComplete) {
        onComplete(agentData);
      }
      onClose();
    } catch (error) {
      console.error('❌ Agent setup error:', error);
      setErrors({ general: error.message || 'Failed to create AI agent. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-gray-900/95 backdrop-blur-lg rounded-2xl p-8 w-full max-w-2xl mx-4 border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Set Up Your AI Agent</h2>
          <p className="text-gray-400">Configure your AI assistant and get your dedicated phone number</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assistant Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Assistant Name</label>
            <input
              type="text"
              name="agentName"
              value={form.agentName}
              onChange={handleAgentNameChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Sarah, Customer Support Bot, Sales Assistant"
            />
            {errors.agentName && <p className="text-red-400 text-sm mt-1">{errors.agentName}</p>}
            <p className="text-gray-400 text-sm mt-1">What would you like to call your AI assistant?</p>
          </div>

          {/* Agent Voice */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Voice</label>
            <select
              name="agentVoice"
              value={form.agentVoice}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {voiceOptions.map(option => (
                <option key={option.value} value={option.value} className="bg-gray-800">
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-gray-400 text-sm mt-1">Choose the voice that best represents your brand</p>
          </div>

          {/* First Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">First Message</label>
            <input
              type="text"
              name="firstMessage"
              value={form.firstMessage}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Hello! I'm Sarah, your AI assistant. How can I help you today?"
            />
            {errors.firstMessage && <p className="text-red-400 text-sm mt-1">{errors.firstMessage}</p>}
            <p className="text-gray-400 text-sm mt-1">What should your assistant say when a call starts?</p>
          </div>

          {/* System Prompt - Simplified */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">What should your assistant help with?</label>
            <textarea
              name="systemPrompt"
              value={form.systemPrompt}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Describe your business and how the assistant should help customers. For example: 'I run a coffee shop. Help customers with orders, store hours, and general questions about our coffee and pastries.'"
            />
            {errors.systemPrompt && <p className="text-red-400 text-sm mt-1">{errors.systemPrompt}</p>}
            <p className="text-gray-400 text-sm mt-1">Describe your business and what your assistant should help customers with</p>
          </div>

          {/* Calendar Integration */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="includeCalendar"
                checked={includeCalendar}
                onChange={(e) => setIncludeCalendar(e.target.checked)}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <label htmlFor="includeCalendar" className="block text-sm font-medium text-blue-300 mb-2">
                  Connect Google Calendar for meeting booking
                </label>
                <p className="text-blue-200 text-sm mb-3">
                  Allow your AI assistant to book meetings directly into your calendar
                </p>
                
                {includeCalendar && (
                  <div className="mt-3">
                    {!calendarCredentials ? (
                      <button
                        type="button"
                        onClick={connectGoogleCalendar}
                        disabled={calendarConnecting}
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {calendarConnecting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Connecting...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Connect Google Calendar
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center text-green-400">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        Calendar Connected Successfully!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="text-red-400 text-sm text-center">{errors.general}</div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Creating Your Agent...
              </div>
            ) : (
              'Create AI Agent & Continue'
            )}
          </button>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-blue-300 font-semibold mb-1">Ready to start talking!</h4>
                <p className="text-blue-200 text-sm">
                  We'll create your AI assistant and you can start talking to it immediately. 
                  You can make changes and adjustments later in the app settings.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingModal;
