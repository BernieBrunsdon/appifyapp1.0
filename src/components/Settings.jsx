import React, { useState, useEffect } from 'react';
import { getAssistantManager } from '../utils/assistantManager';

const Settings = () => {
  const [settings, setSettings] = useState({
    assistantName: '',
    voice: 'alloy',
    model: 'gpt-4o',
    temperature: 0.7,
    knowledgeBase: '',
    firstMessage: 'Hello! How can I help you today?'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Voice options (from Vapi docs)
  const voiceOptions = [
    { value: 'alloy', label: 'Alloy (Neutral)' },
    { value: 'echo', label: 'Echo (Male)' },
    { value: 'fable', label: 'Fable (Male)' },
    { value: 'onyx', label: 'Onyx (Male)' },
    { value: 'nova', label: 'Nova (Female)' },
    { value: 'shimmer', label: 'Shimmer (Female)' }
  ];

  // Model options (from Vapi docs)
  const modelOptions = [
    { value: 'gpt-4o', label: 'GPT-4o (Latest)' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Faster)' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
  ];

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Load agent data from localStorage
      const storedAgentData = localStorage.getItem('agentData');
      const storedUser = localStorage.getItem('user');
      
      let agentData = null;
      if (storedAgentData) {
        try {
          agentData = JSON.parse(storedAgentData);
          console.log('✅ Settings loaded agent data from agentData:', agentData);
        } catch (err) {
          console.error('Error parsing stored agent data:', err);
        }
      } else if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.agent) {
            agentData = user.agent;
            console.log('✅ Settings loaded agent data from user.agent:', agentData);
          }
        } catch (err) {
          console.error('Error parsing user data:', err);
        }
      }
      
      if (agentData) {
        setSettings({
          assistantName: agentData.agentName || agentData.name || '',
          voice: agentData.agentVoice || agentData.voice || 'alloy',
          model: 'gpt-4o',
          temperature: 0.7,
          knowledgeBase: agentData.systemPrompt || '',
          firstMessage: agentData.firstMessage || 'Hello! How can I help you today?'
        });
      } else {
        // Fallback to saved settings
        const savedSettings = localStorage.getItem('assistantSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      // Get client ID (for now, use a mock ID - will be from Firebase auth later)
      const clientId = localStorage.getItem('demo_token') || 'demo-client';
      const assistantManager = getAssistantManager(clientId);
      
      // Save settings to localStorage
      localStorage.setItem('assistantSettings', JSON.stringify(settings));
      
      // Create or update Vapi assistant
      const assistant = await assistantManager.getOrCreateAssistant(settings);
      
      setMessage(`Settings saved successfully! Assistant ID: ${assistant.id}`);
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg-professional flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg-professional">
      {/* Header */}
      <div className="bg-secondary-bg border-b border-border-gray px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary heading-primary">AI Assistant Settings</h1>
            <p className="text-text-secondary">Configure your voice AI assistant</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-4xl mx-auto">
        {/* Success Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('Error') 
              ? 'bg-red-500/10 text-red-300 border border-red-500/20' 
              : 'bg-green-500/10 text-green-300 border border-green-500/20'
          }`}>
            {message}
          </div>
        )}

        {/* Basic Settings */}
        <div className="card mb-6">
          <div className="px-6 py-4 border-b border-border-gray">
            <h2 className="text-lg font-semibold text-text-primary">Basic Settings</h2>
            <p className="text-sm text-text-secondary">Configure your assistant's basic behavior</p>
          </div>
          <div className="p-6 space-y-6">
            {/* Assistant Name */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Assistant Name
              </label>
              <input
                type="text"
                value={settings.assistantName}
                onChange={(e) => handleInputChange('assistantName', e.target.value)}
                className="input-field w-full"
                placeholder="My AI Assistant"
              />
            </div>

            {/* First Message */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                First Message
              </label>
              <textarea
                value={settings.firstMessage}
                onChange={(e) => handleInputChange('firstMessage', e.target.value)}
                className="input-field w-full"
                rows={3}
                placeholder="Hello! How can I help you today?"
              />
            </div>

            {/* Voice Selection */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Voice
              </label>
              <select
                value={settings.voice}
                onChange={(e) => handleInputChange('voice', e.target.value)}
                className="input-field w-full"
              >
                {voiceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                AI Model
              </label>
              <select
                value={settings.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="input-field w-full"
              >
                {modelOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Creativity Level: {settings.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                className="w-full h-2 bg-border-gray rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>Focused</span>
                <span>Creative</span>
              </div>
            </div>
          </div>
        </div>

        {/* Knowledge Base */}
        <div className="card">
          <div className="px-6 py-4 border-b border-border-gray">
            <h2 className="text-lg font-semibold text-text-primary">Knowledge Base</h2>
            <p className="text-sm text-text-secondary">Add information about your business to help your assistant answer questions</p>
          </div>
          <div className="p-6">
            <textarea
              value={settings.knowledgeBase}
              onChange={(e) => handleInputChange('knowledgeBase', e.target.value)}
              className="input-field w-full"
              rows={8}
              placeholder="Enter information about your business, products, services, policies, etc. This will help your AI assistant provide accurate and helpful responses to your customers.

Example:
- We are a software company specializing in AI solutions
- Our main product is a voice AI assistant for businesses
- We offer 24/7 customer support
- Our pricing starts at $99/month
- We have offices in New York and San Francisco"
            />
            <div className="mt-2 text-sm text-text-secondary">
              This information will be added to your assistant's system prompt to help it understand your business better.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
