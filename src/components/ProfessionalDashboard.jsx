import React, { useState, useEffect } from 'react';
import unifiedAuthService from '../utils/unifiedAuthService';

/**
 * Professional Dashboard Component
 * Showcases the full Appify.AI platform capabilities
 */

const ProfessionalDashboard = ({ user, agent, onLogout }) => {
  const [stats, setStats] = useState({
    totalCalls: 0,
    activeCalls: 0,
    successRate: 0,
    avgDuration: 0,
    todayCalls: 0
  });

  const [recentCalls, setRecentCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [callStatus, setCallStatus] = useState('idle');

  // Load demo data
  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = async () => {
    setLoading(true);
    
    try {
      // Simulate loading professional demo data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Professional demo statistics
      setStats({
        totalCalls: 247,
        activeCalls: 3,
        successRate: 94,
        avgDuration: 4.2,
        todayCalls: 12
      });

      // Professional demo call history
      setRecentCalls([
        {
          id: 'call_001',
          phoneNumber: '+1 (555) 123-4567',
          duration: 180,
          status: 'completed',
          transcription: 'Customer inquiry about pricing and features. Provided detailed information about Appify.AI platform.',
          createdAt: new Date(Date.now() - 300000).toISOString(),
          quality: 'excellent'
        },
        {
          id: 'call_002',
          phoneNumber: '+1 (555) 987-6543',
          duration: 240,
          status: 'completed',
          transcription: 'Technical support call. Resolved issue with WhatsApp integration setup.',
          createdAt: new Date(Date.now() - 600000).toISOString(),
          quality: 'good'
        },
        {
          id: 'call_003',
          phoneNumber: '+1 (555) 456-7890',
          duration: 120,
          status: 'completed',
          transcription: 'Sales inquiry. Scheduled follow-up call for next week.',
          createdAt: new Date(Date.now() - 900000).toISOString(),
          quality: 'excellent'
        }
      ]);
      
    } catch (error) {
      console.error('Error loading demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startDemoCall = async () => {
    setCallStatus('starting');
    
    try {
      // Simulate call initiation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCallStatus('in-call');
      
      // Simulate call duration
      setTimeout(() => {
        setCallStatus('idle');
        // Add new call to history
        const newCall = {
          id: `call_${Date.now()}`,
          phoneNumber: '+1 (555) 000-0000',
          duration: 150,
          status: 'completed',
          transcription: 'Demo call completed successfully. Customer was impressed with the AI assistant quality.',
          createdAt: new Date().toISOString(),
          quality: 'excellent'
        };
        setRecentCalls(prev => [newCall, ...prev.slice(0, 9)]);
        setStats(prev => ({
          ...prev,
          totalCalls: prev.totalCalls + 1,
          todayCalls: prev.todayCalls + 1
        }));
      }, 10000); // 10 second demo call
      
    } catch (error) {
      console.error('Demo call error:', error);
      setCallStatus('idle');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (phone) => {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Professional Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <header className="flex justify-between items-center py-6 px-4 md:px-8">
        <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Appify.AI
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-white">
            Welcome, {user?.firstName || 'Professional User'}!
          </div>
          <button
            onClick={onLogout}
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
            Professional AI Assistant Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Manage {agent?.agentName || 'your AI assistant'} and monitor performance across all channels
          </p>
          {agent && (
            <div className="mt-4 flex items-center space-x-6 text-sm text-gray-300">
              <span>Assistant: {agent.agentName}</span>
              <span>•</span>
              <span>Voice: {agent.agentVoice}</span>
              <span>•</span>
              <span>Status: Active</span>
              <span>•</span>
              <span>Plan: {user?.plan || 'Professional'}</span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Calls</p>
                <p className="text-2xl font-bold text-white">{stats.totalCalls}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Calls</p>
                <p className="text-2xl font-bold text-white">{stats.activeCalls}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-white">{stats.successRate}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Duration</p>
                <p className="text-2xl font-bold text-white">{stats.avgDuration}m</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Call Demo */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Professional Voice Call Demo</h2>
            <p className="text-gray-400 mb-8">Experience high-quality AI voice calls powered by Vapi</p>
            
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-pulse" style={{animationDelay: '1s'}}></div>
                
                <button
                  onClick={callStatus === 'idle' ? startDemoCall : () => setCallStatus('idle')}
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
                {callStatus === 'idle' && '🎤 Click to start demo call'}
                {callStatus === 'starting' && '⏳ Connecting...'}
                {callStatus === 'in-call' && '📞 Demo Call Active - AI Assistant Speaking!'}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Calls */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Professional Calls</h2>
          
          <div className="space-y-4">
            {recentCalls.map((call) => (
              <div key={call.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium">{formatPhoneNumber(call.phoneNumber)}</p>
                      <p className="text-gray-400 text-sm">{new Date(call.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{formatDuration(call.duration)}</p>
                    <p className="text-gray-400 text-sm capitalize">{call.status}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mt-2">{call.transcription}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">Quality: {call.quality}</span>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfessionalDashboard;