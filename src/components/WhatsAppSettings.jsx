import React, { useState, useEffect } from 'react';

const WhatsAppSettings = () => {
  const [settings, setSettings] = useState({
    enabled: false,
    phoneNumber: '',
    welcomeMessage: 'Hello! How can I help you today?',
    businessHours: {
      enabled: true,
      start: '09:00',
      end: '17:00',
      timezone: 'America/New_York',
      message: 'Sorry, we are currently closed. Please contact us during business hours.'
    },
    autoReply: {
      enabled: true,
      message: 'Thank you for your message. We will get back to you soon!'
    },
    aiResponses: {
      enabled: true,
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 150
    }
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('whatsapp_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage
      localStorage.setItem('whatsapp_settings', JSON.stringify(settings));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!settings.phoneNumber) {
      alert('Please enter a phone number first');
      return;
    }

    try {
      // Test WhatsApp connection
      const response = await fetch('https://appify-ai-server.onrender.com/api/whatsapp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: settings.phoneNumber,
          message: settings.welcomeMessage
        })
      });

      if (response.ok) {
        alert('Test message sent successfully!');
      } else {
        alert('Failed to send test message. Please check your configuration.');
      }
    } catch (error) {
      console.error('Test error:', error);
      alert('Error sending test message. Please check your server connection.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">WhatsApp Settings</h1>
        <p className="text-gray-400">Configure your WhatsApp AI assistant and messaging preferences</p>
      </div>

      <div className="space-y-8">
        {/* General Settings */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">General Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Enable WhatsApp</label>
                <p className="text-gray-400 text-sm">Turn on WhatsApp AI responses</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => handleInputChange('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">WhatsApp Phone Number</label>
              <input
                type="tel"
                value={settings.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="+1234567890"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-gray-400 text-sm mt-1">Your business WhatsApp number</p>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Welcome Message</label>
              <textarea
                value={settings.welcomeMessage}
                onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
                placeholder="Hello! How can I help you today?"
                rows={3}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Business Hours</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Enable Business Hours</label>
                <p className="text-gray-400 text-sm">Send custom message outside business hours</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.businessHours.enabled}
                  onChange={(e) => handleNestedInputChange('businessHours', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {settings.businessHours.enabled && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Start Time</label>
                    <input
                      type="time"
                      value={settings.businessHours.start}
                      onChange={(e) => handleNestedInputChange('businessHours', 'start', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">End Time</label>
                    <input
                      type="time"
                      value={settings.businessHours.end}
                      onChange={(e) => handleNestedInputChange('businessHours', 'end', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">After Hours Message</label>
                  <textarea
                    value={settings.businessHours.message}
                    onChange={(e) => handleNestedInputChange('businessHours', 'message', e.target.value)}
                    placeholder="Sorry, we are currently closed..."
                    rows={2}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* AI Responses */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">AI Response Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Enable AI Responses</label>
                <p className="text-gray-400 text-sm">Use AI to generate intelligent responses</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.aiResponses.enabled}
                  onChange={(e) => handleNestedInputChange('aiResponses', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {settings.aiResponses.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">AI Model</label>
                  <select
                    value={settings.aiResponses.model}
                    onChange={(e) => handleNestedInputChange('aiResponses', 'model', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="claude-3">Claude 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Temperature: {settings.aiResponses.temperature}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.aiResponses.temperature}
                    onChange={(e) => handleNestedInputChange('aiResponses', 'temperature', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Auto Reply */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Auto Reply</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Enable Auto Reply</label>
                <p className="text-gray-400 text-sm">Send automatic acknowledgment messages</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoReply.enabled}
                  onChange={(e) => handleNestedInputChange('autoReply', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {settings.autoReply.enabled && (
              <div>
                <label className="block text-white font-medium mb-2">Auto Reply Message</label>
                <textarea
                  value={settings.autoReply.message}
                  onChange={(e) => handleNestedInputChange('autoReply', 'message', e.target.value)}
                  placeholder="Thank you for your message. We will get back to you soon!"
                  rows={2}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
          
          <button
            onClick={handleTest}
            disabled={!settings.phoneNumber}
            className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test WhatsApp
          </button>
        </div>

        {saved && (
          <div className="bg-green-600/20 border border-green-600 text-green-400 px-4 py-3 rounded-lg">
            Settings saved successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppSettings;
