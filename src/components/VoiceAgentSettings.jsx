import React, { useEffect, useState, useRef } from 'react';
import OnboardingModal from './OnboardingModal';

const API_URL = 'https://api.vapi.ai/assistant';
const REST_API_KEY = process.env.REACT_APP_VAPI_API_KEY;
const PUBLIC_KEY = '1982777e-4159-4b67-981d-4a99ae5faf31';


export default function VoiceAgentSettings({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', greeting: '', voice: 'alloy' });
  const [callStatus, setCallStatus] = useState('idle');
  const [vapiLoaded, setVapiLoaded] = useState(false);
  const [agentData, setAgentData] = useState(null);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  
  const vapiRef = useRef(null);

  // Get agent ID from localStorage
  const getAgentId = () => {
    const storedAgentData = localStorage.getItem('agentData');
    const storedUser = localStorage.getItem('user');
    
    if (storedAgentData) {
      try {
        const agentData = JSON.parse(storedAgentData);
        return agentData.vapiAssistantId || agentData.id;
      } catch (err) {
        console.error('Error parsing stored agent data:', err);
      }
    }
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.agent && user.agent.vapiAssistantId) {
          return user.agent.vapiAssistantId;
        }
      } catch (err) {
        console.error('Error parsing stored user data:', err);
      }
    }
    
    return null;
  };

  // Load agent data
  useEffect(() => {
    const loadAgentData = async () => {
      try {
        setLoading(true);
        
        // Get agent data from localStorage
        const storedAgentData = localStorage.getItem('agentData');
        const storedUser = localStorage.getItem('user');
        
        let agent = null;
        if (storedAgentData) {
          agent = JSON.parse(storedAgentData);
        } else if (storedUser) {
          const user = JSON.parse(storedUser);
          agent = user.agent;
        }
        
        if (agent) {
          setAgentData(agent);
          setForm({
            name: agent.agentName || '',
            greeting: agent.firstMessage || '',
            voice: agent.agentVoice || 'alloy'
          });
          
          // Load agent details from Vapi if we have an ID
          if (agent.vapiAssistantId) {
            await loadAgentFromVapi(agent.vapiAssistantId);
          }
        }
      } catch (error) {
        console.error('Error loading agent data:', error);
        setError('Failed to load agent data');
      } finally {
        setLoading(false);
      }
    };
    
    loadAgentData();
  }, []);

  // Load agent from Vapi API
  const loadAgentFromVapi = async (agentId) => {
    try {
      const response = await fetch(`${API_URL}/${agentId}`, {
        headers: { Authorization: `Bearer ${REST_API_KEY}` }
      });
      
      if (response.ok) {
        const agent = await response.json();
        setForm({
          name: agent.name || '',
          greeting: agent.firstMessage || '',
          voice: agent.voice || 'alloy'
        });
      } else {
        console.warn('Failed to load agent from Vapi:', response.status);
      }
    } catch (error) {
      console.error('Error loading agent from Vapi:', error);
    }
  };

  // Initialize Vapi
  useEffect(() => {
    const initVapi = async () => {
      try {
        const Vapi = (await import('@vapi-ai/web')).default;
        vapiRef.current = new Vapi(PUBLIC_KEY);
        
        vapiRef.current.on('call-start', () => {
          setCallStatus('active');
          showToast('Call started!');
        });
        
        vapiRef.current.on('call-end', () => {
          setCallStatus('idle');
          showToast('Call ended');
        });
        
        setVapiLoaded(true);
        console.log('✅ Vapi initialized successfully');
      } catch (error) {
        console.error('Error initializing Vapi:', error);
        setError('Failed to initialize voice system');
      }
    };
    
    initVapi();
  }, [showToast]);

  // Start call
  const startCall = async () => {
    try {
      const agentId = getAgentId();
      if (!agentId) {
        showToast('No assistant configured. Please set up your assistant first.');
        return;
      }
      
      if (!vapiRef.current) {
        showToast('Voice system not ready. Please try again.');
        return;
      }
      
      setCallStatus('starting');
      await vapiRef.current.start(agentId);
    } catch (error) {
      console.error('Error starting call:', error);
      setCallStatus('idle');
      showToast('Failed to start call. Please try again.');
    }
  };

  // Save settings
  const saveSettings = async () => {
    try {
      setSaving(true);
      setError('');
      
      const agentId = getAgentId();
      if (!agentId) {
        setError('No assistant configured');
        return;
      }
      
      // Update agent in Vapi
      const response = await fetch(`${API_URL}/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${REST_API_KEY}`
        },
        body: JSON.stringify({
          name: form.name,
          firstMessage: form.greeting,
          voice: form.voice
        })
      });
      
      if (response.ok) {
        showToast('Settings saved successfully!');
        await loadAgentFromVapi(agentId);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white">Loading voice agent...</p>
        </div>
      </div>
    );
  }

  if (!agentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="text-purple-400 text-6xl mb-4">🤖</div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Appify.AI!</h2>
          <p className="text-gray-300 mb-4">Let's set up your AI assistant to get started.</p>
          <button 
            onClick={() => setShowOnboardingModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg"
          >
            Set Up Assistant
          </button>
        </div>
        
        {/* Onboarding Modal */}
        <OnboardingModal 
          isOpen={showOnboardingModal} 
          onClose={() => setShowOnboardingModal(false)} 
          clientData={JSON.parse(localStorage.getItem('user') || '{}')}
          onComplete={(agentData) => {
            // Reload the component to show the assistant settings
            window.location.reload();
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Voice Agent</h1>
            <p className="text-gray-300">
              Test your AI agent and manage voice settings
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${vapiLoaded ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-300">
                {vapiLoaded ? 'Voice Ready' : 'Voice Loading...'}
              </span>
            </div>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Voice Control - Beautiful Design */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Voice Agent Control</h2>
            <p className="text-gray-300 mb-8">Test your AI agent with a live call</p>
            
            {/* Beautiful Mic Button - Matching Marketing Page */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Outer glowing ring - purple-blue */}
                <div className="absolute inset-0 rounded-full border-4 border-purple-400/60 animate-pulse shadow-lg shadow-purple-500/30"></div>
                <div className="absolute inset-2 rounded-full border-2 border-blue-400/40 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                
                {/* Main button - dark blue inner disc */}
                <button
                  onClick={startCall}
                  disabled={callStatus !== 'idle' || !vapiLoaded}
                  className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-2xl ${
                    callStatus === 'idle' && vapiLoaded
                      ? 'bg-gradient-to-br from-blue-800 to-blue-900 hover:from-blue-700 hover:to-blue-800 hover:shadow-purple-500/50'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  {callStatus === 'starting' ? (
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : callStatus === 'active' ? (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h12v12H6z"/>
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {/* Status text - Matching Marketing Page */}
            <div className="text-center">
              <p className={`text-lg font-semibold mb-2 ${
                callStatus === 'idle' ? 'text-green-400' : 
                callStatus === 'starting' ? 'text-yellow-400' : 
                callStatus === 'active' ? 'text-green-400' : 'text-gray-400'
              }`}>
                {callStatus === 'idle' ? 'Click to start call' : 
                 callStatus === 'starting' ? 'Starting call...' : 
                 callStatus === 'active' ? 'Call in progress...' : 'Ready to call'}
              </p>
              <p className="text-gray-400 text-sm">
                {vapiLoaded ? 'Voice system ready' : 'Initializing voice system...'}
              </p>
            </div>
          </div>
        </div>

        {/* Agent Settings */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Agent Settings</h2>
          <p className="text-gray-300 mb-6">Configure your AI assistant's voice and behavior</p>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}
          
          <div className="space-y-6">
            {/* Assistant Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Assistant Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                placeholder="Enter assistant name"
              />
            </div>

            {/* First Message */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                First Message
              </label>
              <textarea
                value={form.greeting}
                onChange={(e) => setForm({...form, greeting: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none"
                placeholder="Enter the first message your assistant will say"
              />
            </div>

            {/* Voice Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Voice
              </label>
              <select
                value={form.voice}
                onChange={(e) => setForm({...form, voice: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
              >
                <option value="alloy">Alloy (Neutral)</option>
                <option value="echo">Echo (Male)</option>
                <option value="fable">Fable (British)</option>
                <option value="onyx">Onyx (Deep)</option>
                <option value="nova">Nova (Female)</option>
                <option value="shimmer">Shimmer (Soft)</option>
              </select>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}