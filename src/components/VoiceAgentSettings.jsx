import React, { useEffect, useState, useRef } from 'react';
import { getAssistantManager } from '../utils/assistantManager';
// import Vapi from '@vapi-ai/web'; // Removed static import to use dynamic import

const PUBLIC_KEY = '1982777e-4159-4b67-981d-4a99ae5faf31'; // Public key for mic calls - allows all assistants

function getCurrentUsername() {
  const token = localStorage.getItem('demo_token');
  if (!token) return '';
  return token.replace('demo_token_', '');
}

export default function VoiceAgentSettings({ showToast }) {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', greeting: '', voice: '' });
  const [callStatus, setCallStatus] = useState('idle');
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalCalls: 0,
    successfulCalls: 0,
    avgCallDuration: 0,
    todayCalls: 0
  });
  
  const token = localStorage.getItem('demo_token');
  const username = getCurrentUsername();
  const vapiRef = useRef(null);
  
  // Get agent ID from localStorage (newly created agent)
  const getAgentId = () => {
    const storedAgentData = localStorage.getItem('agentData');
    const storedUser = localStorage.getItem('user');
    
    console.log('🔍 SIMPLE AGENT ID LOOKUP:');
    console.log('🔍 storedAgentData:', storedAgentData ? 'EXISTS' : 'NULL');
    console.log('🔍 storedUser:', storedUser ? 'EXISTS' : 'NULL');
    
    if (storedAgentData) {
      try {
        const agentData = JSON.parse(storedAgentData);
        console.log('🔍 Using agentData.vapiAssistantId:', agentData.vapiAssistantId);
        return agentData.vapiAssistantId || agentData.id;
      } catch (err) {
        console.error('Error parsing stored agent data:', err);
      }
    }
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.agent) {
          console.log('🔍 Using user.agent.vapiAssistantId:', user.agent.vapiAssistantId);
          return user.agent.vapiAssistantId || user.agent.id;
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
    
    console.log('🔍 No agent data found, using fallback');
    return null; // No fallback needed with Firebase auth
  };
  
  const agentId = getAgentId();

  // Load user data
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (!agentId) {
      setError(`No agent assigned to your account. Username: '${username}'. Please contact support.`);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Try to load agent data from localStorage first (newly created agent)
    const storedAgentData = localStorage.getItem('agentData');
    const storedUser = localStorage.getItem('user');
    
    let agentData = null;
    if (storedAgentData) {
      try {
        agentData = JSON.parse(storedAgentData);
        console.log('✅ VoiceAgentSettings loaded agent data from agentData:', agentData);
      } catch (err) {
        console.error('Error parsing stored agent data:', err);
      }
    } else if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.agent) {
          agentData = user.agent;
          console.log('✅ VoiceAgentSettings loaded agent data from user.agent:', agentData);
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
    
    if (agentData) {
      setAgent(agentData);
      setForm({
        name: agentData.agentName || agentData.name || '',
        greeting: agentData.firstMessage || agentData.description || '',
        voice: agentData.agentVoice || agentData.voice || ''
      });
      setLoading(false);
      return;
    }

    // Fallback to API fetch for existing agents
    const assistantManager = getAssistantManager(username);
    
    assistantManager.getAssistant(agentId)
      .then(agent => {
        setAgent(agent);
        setForm({
          name: agent.name || '',
          greeting: agent.firstMessage || '',
          voice: agent.voice?.voiceId || ''
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching agent:', err);
        setError(`Failed to fetch agent: ${err.message}`);
        setLoading(false);
      });
  }, [agentId, username]);

  // Initialize Vapi
  useEffect(() => {
    const initVapi = async () => {
      try {
        // Import Vapi dynamically
        const VapiModule = await import('@vapi-ai/web');
        const Vapi = VapiModule.default || VapiModule;
        
        console.log('🔧 VERSION 2.0 - Initializing Vapi with key:', PUBLIC_KEY.substring(0, 8) + '...');
        console.log('🔧 VERSION 2.0 - Full public key:', PUBLIC_KEY);
        
        // Try to create client with error handling
        let client;
        try {
          client = new Vapi(PUBLIC_KEY);
          console.log('✅ VERSION 2.0 - Vapi client created successfully');
        } catch (createError) {
          console.error('❌ Error creating Vapi client:', createError);
          return;
        }
        
        client.on('call-start', () => {
          console.log('📞 Call started');
          setCallStatus('in-call');
        });
        client.on('call-end', () => {
          console.log('📞 Call ended');
          setCallStatus('idle');
        });
        client.on('call-error', (error) => {
          console.error('📞 Call error:', error);
          setCallStatus('idle');
        });
        
        vapiRef.current = client;
        console.log('✅ VERSION 2.0 - Vapi client initialized successfully');
        
        // Test if we can access the assistant
        console.log('🧪 Testing Vapi client methods:', Object.getOwnPropertyNames(client));
        console.log('🧪 Vapi client start method:', typeof client.start);
        
        // Vapi client is ready for real calls
        console.log('🧪 VERSION 2.0 - Vapi client ready for calls');
      } catch (error) {
        console.error('❌ Error initializing Vapi:', error);
      }
    };
    
    initVapi();
  }, []);

  const startCall = () => {
    if (callStatus !== 'idle' || !vapiRef.current) return;

    if (!agentId) {
      showToast('No assistant ID found. Please create an assistant first.');
      return;
    }

    setCallStatus('starting');
    try {
      console.log('🎤 VERSION 2.0 - Starting call with assistant ID:', agentId);
      console.log('🎤 VERSION 2.0 - Assistant ID type:', typeof agentId);
      console.log('🎤 VERSION 2.0 - Assistant ID length:', agentId.length);
      console.log('🎤 VERSION 2.0 - Using API key:', PUBLIC_KEY.substring(0, 8) + '...');
      console.log('🎤 VERSION 2.0 - Full API key:', PUBLIC_KEY);
      console.log('🎤 VERSION 2.0 - Vapi client initialized:', !!vapiRef.current);
      console.log('🎤 VERSION 2.0 - Vapi client type:', typeof vapiRef.current);
      
      // Test if the assistant ID is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      console.log('🎤 Assistant ID is valid UUID:', uuidRegex.test(agentId));
      
      console.log('🎤 About to call vapiRef.current.start with:', agentId);
      vapiRef.current.start(agentId);
      console.log('🎤 vapiRef.current.start called successfully');
    } catch (error) {
      console.error('Error starting call:', error);
      setCallStatus('idle');
      showToast('Failed to start call. Please try again.');
    }
  };

  const endCall = () => {
    if (callStatus !== 'in-call' || !vapiRef.current) return;
    
    console.log('📞 Ending call');
    try {
      // Try different methods to end the call
      if (typeof vapiRef.current.stop === 'function') {
        console.log('🛑 Using stop() method');
        vapiRef.current.stop();
      } else if (typeof vapiRef.current.hangup === 'function') {
        console.log('🛑 Using hangup() method');
        vapiRef.current.hangup();
      } else if (typeof vapiRef.current.end === 'function') {
        console.log('🛑 Using end() method');
        vapiRef.current.end();
      } else {
        console.error('❌ No end call method available');
        setCallStatus('idle');
      }
      
      // Fallback: Force status reset after 2 seconds if Vapi event doesn't fire
      setTimeout(() => {
        if (callStatus === 'in-call') {
          console.log('⚠️ Forcing call status reset - Vapi event may not have fired');
          setCallStatus('idle');
        }
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error ending call:', error);
      setCallStatus('idle');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const assistantManager = getAssistantManager(username);
      
      const settings = {
        assistantName: form.name,
        firstMessage: form.greeting,
        voice: form.voice,
        model: 'gpt-4o',
        temperature: 0.7,
        knowledgeBase: form.greeting // Using greeting as knowledge base for now
      };

      if (agentId) {
        // Update existing assistant
        await assistantManager.updateAssistant(agentId, settings);
        showToast('Settings updated successfully!');
      } else {
        // Create new assistant
        const newAssistant = await assistantManager.createAssistant(settings);
        setAgent(newAssistant);
        showToast('Assistant created successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast(`Failed to save settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('demo_token');
    localStorage.removeItem('user');
    localStorage.removeItem('agentData');
    window.location.href = '/';
  };

  const handleClearAgentData = () => {
    localStorage.removeItem('agentData');
    localStorage.removeItem('user');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Beautiful Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-pink-900/20 via-purple-900/20 to-blue-900/20"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center py-6 px-4 md:px-8">
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Appify.AI
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-white">
              Welcome, {user?.firstName || 'User'}!
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-300 hover:text-white transition"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 md:px-8 pb-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              {agent ? `${agent.name} Dashboard` : 'AI Agent Dashboard'}
            </h1>
            <p className="text-gray-400 text-lg">
              {agent ? `Manage ${agent.name} and monitor performance` : 'Manage your voice AI agent and monitor performance'}
            </p>
            {agent && (
              <div className="mt-4 flex items-center space-x-6 text-sm text-gray-300">
                <span>Voice: {agent.voice}</span>
                <span>•</span>
                <span>Phone: {agent.phoneNumber}</span>
                <span>•</span>
                <span>Region: {agent.region?.toUpperCase()}</span>
                <span>•</span>
                <span>Assistant ID: {agent.id?.substring(0, 8)}...</span>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Calls</p>
                  <p className="text-2xl font-bold text-white">{stats.totalCalls}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-white">{stats.successfulCalls}%</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Duration</p>
                  <p className="text-2xl font-bold text-white">{stats.avgCallDuration}m</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Today's Calls</p>
                  <p className="text-2xl font-bold text-white">{stats.todayCalls}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Agent Control */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 mb-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Voice Agent Control</h2>
              <p className="text-gray-400 mb-8">Test your AI agent with a live call</p>
              
              <div className="flex flex-col items-center">
                <div className="relative w-48 h-48 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-pulse"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-pulse" style={{animationDelay: '1s'}}></div>
                  
                  <button
                    onClick={callStatus === 'idle' ? startCall : endCall}
                    disabled={callStatus === 'starting'}
                    className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
                      callStatus === 'in-call' 
                        ? 'bg-red-500/80 border-2 border-red-400 hover:bg-red-600/80 animate-pulse' 
                        : callStatus === 'starting'
                        ? 'bg-yellow-500/80 border-2 border-yellow-400 animate-pulse'
                        : 'bg-gray-800/60 border-2 border-gray-600 hover:border-purple-500 hover:scale-105'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {callStatus === 'in-call' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6v6H9z" />
                      </svg>
                    ) : callStatus === 'starting' ? (
                      <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                <p className={`text-lg font-semibold h-8 transition-all duration-300 ${
                  callStatus === 'idle' ? 'text-green-400' :
                  callStatus === 'starting' ? 'text-yellow-400 animate-pulse' :
                  callStatus === 'in-call' ? 'text-red-400 animate-pulse' :
                  'text-gray-400'
                }`}>
                  {callStatus === 'idle' && '🎤 Click to start call'}
                  {callStatus === 'starting' && '⏳ Starting call...'}
                  {callStatus === 'in-call' && '📞 Call Active - Speak Now!'}
                </p>
              </div>
            </div>
          </div>

          {/* Agent Settings */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Agent Settings</h2>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Clear Agent Data Button */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-yellow-300 font-semibold mb-1">⚠️ Invalid Assistant ID Detected</h4>
                  <p className="text-yellow-200 text-sm">
                    The current assistant ID ({agentId}) is not valid in Vapi. This usually happens when the assistant creation failed.
                  </p>
                </div>
                <button
                  onClick={handleClearAgentData}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                >
                  Clear & Recreate
                </button>
              </div>
            </div>

            {/* Agent Info Display */}
            {agent && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-6">
                <h3 className="text-green-300 font-semibold mb-3">✅ Agent Successfully Created</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-200">Name:</span>
                    <span className="text-white ml-2">{agent.name}</span>
                  </div>
                  <div>
                    <span className="text-green-200">Voice:</span>
                    <span className="text-white ml-2">{agent.voice}</span>
                  </div>
                  <div>
                    <span className="text-green-200">Phone Number:</span>
                    <span className="text-white ml-2">{agent.phoneNumber}</span>
                  </div>
                  <div>
                    <span className="text-green-200">Region:</span>
                    <span className="text-white ml-2">{agent.region?.toUpperCase()}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-green-200">Assistant ID:</span>
                    <span className="text-white ml-2 font-mono text-xs">{agent.id}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Agent Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="My AI Agent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Voice Type</label>
                <select
                  value={form.voice}
                  onChange={(e) => setForm({...form, voice: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Voice</option>
                  <option value="alloy">Alloy</option>
                  <option value="echo">Echo</option>
                  <option value="fable">Fable</option>
                  <option value="onyx">Onyx</option>
                  <option value="nova">Nova</option>
                  <option value="shimmer">Shimmer</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={form.greeting}
                onChange={(e) => setForm({...form, greeting: e.target.value})}
                rows="4"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe what your AI agent should do..."
              />
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}