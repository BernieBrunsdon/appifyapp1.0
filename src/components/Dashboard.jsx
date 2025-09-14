import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCalls: 0,
    activeCalls: 0,
    successRate: 0,
    avgDuration: 0
  });

  const [recentCalls, setRecentCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [agentData, setAgentData] = useState(null);
  const [userData, setUserData] = useState(null);

  // Load agent and user data from localStorage
  useEffect(() => {
    const loadData = () => {
      console.log('🔍 Dashboard VERSION 4.0 - Loading data...');
      const storedAgent = localStorage.getItem('agentData');
      const storedUser = localStorage.getItem('user');
      
      console.log('🔍 Dashboard VERSION 4.0 - storedAgent:', storedAgent ? 'EXISTS' : 'NULL');
      console.log('🔍 Dashboard VERSION 4.0 - storedUser:', storedUser ? 'EXISTS' : 'NULL');
      
      // Try to get agent data from either location
      let agent = null;
      if (storedAgent) {
        try {
          agent = JSON.parse(storedAgent);
          setAgentData(agent);
          console.log('✅ Dashboard VERSION 4.0 - loaded agent data from agentData:', agent);
          console.log('🔍 Agent name:', agent.agentName, 'Voice:', agent.agentVoice);
        } catch (err) {
          console.error('Error parsing stored agent data:', err);
        }
      } else if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.agent) {
            agent = user.agent;
            setAgentData(agent);
            console.log('✅ Dashboard VERSION 4.0 - loaded agent data from user.agent:', agent);
            console.log('🔍 Agent name:', agent.agentName, 'Voice:', agent.agentVoice);
          }
          setUserData(user);
        } catch (err) {
          console.error('Error parsing stored user data:', err);
        }
      }
      
      if (!agent) {
        console.log('⚠️ Dashboard VERSION 4.0 - No agent data found!');
      }
      
      // Use real agent data for stats and calls
      setTimeout(() => {
        if (agent) {
          setStats({
            totalCalls: 0, // Will be updated with real data
            activeCalls: 0,
            successRate: 0,
            avgDuration: 0
          });
          
          setRecentCalls([
            { 
              id: 1, 
              number: agent.assignedPhoneNumber || agent.phoneNumber || '+1-555-0000', 
              duration: '0s', 
              status: 'no-calls', 
              time: 'No calls yet',
              assistant: agent.agentName || agent.name || 'Unknown'
            }
          ]);
        } else {
          // Fallback to mock data if no agent
          setStats({
            totalCalls: 1247,
            activeCalls: 3,
            successRate: 94.2,
            avgDuration: 4.2
          });
          
          setRecentCalls([
            { id: 1, number: '+1 (555) 123-4567', duration: '4:32', status: 'completed', time: '2 min ago' },
            { id: 2, number: '+1 (555) 987-6543', duration: '2:15', status: 'in-progress', time: '5 min ago' },
            { id: 3, number: '+1 (555) 456-7890', duration: '6:48', status: 'completed', time: '12 min ago' },
            { id: 4, number: '+1 (555) 321-0987', duration: '3:21', status: 'completed', time: '18 min ago' },
            { id: 5, number: '+1 (555) 654-3210', duration: '1:45', status: 'failed', time: '25 min ago' }
          ]);
        }
        
        setIsLoading(false);
      }, 1000);
    };
    
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg-professional flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading your AI dashboard...</p>
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
            <h1 className="text-2xl font-semibold text-text-primary heading-primary">
              {agentData ? `${agentData.agentName || agentData.name} Dashboard` : 'AI Voice Dashboard'}
            </h1>
            <p className="text-text-secondary">
              {agentData ? `Monitor ${agentData.agentName || agentData.name}'s performance in real-time` : 'Monitor your voice AI performance in real-time'}
            </p>
            {agentData && (
              <div className="mt-2 flex items-center space-x-4 text-sm text-text-secondary">
                <span>Voice: {agentData.agentVoice || agentData.voice}</span>
                <span>•</span>
                <span>Phone: {agentData.assignedPhoneNumber || agentData.phoneNumber}</span>
                <span>•</span>
                <span>Assistant ID: {agentData.vapiAssistantId?.substring(0, 8)}...</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-text-secondary">AI Active</span>
            </div>
            <button className="btn-primary">
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Warning Banner if no agent data */}
        {!agentData && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-300">
                  No AI Agent Found
                </h3>
                <div className="mt-2 text-sm text-yellow-200">
                  <p>It looks like you don't have an AI agent set up yet. Please go to Voice Agent settings to create your assistant.</p>
                </div>
                <div className="mt-4">
                  <button 
                    onClick={() => window.location.href = '/voice-agent'}
                    className="bg-yellow-500/20 text-yellow-300 px-3 py-2 rounded-md text-sm font-medium hover:bg-yellow-500/30 transition-colors"
                  >
                    Set Up AI Agent
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card hover:shadow-glow-blue-sm transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Total Calls</p>
                <p className="text-3xl font-bold text-text-primary">{stats.totalCalls.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-accent-blue/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-green-400 font-medium">+12%</span>
              <span className="text-sm text-text-secondary ml-2">vs last week</span>
            </div>
          </div>

          <div className="card hover:shadow-glow-blue-sm transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Active Calls</p>
                <p className="text-3xl font-bold text-text-primary">{stats.activeCalls}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-green-400 font-medium">Live</span>
              <span className="text-sm text-text-secondary ml-2">real-time</span>
            </div>
          </div>

          <div className="card hover:shadow-glow-blue-sm transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Success Rate</p>
                <p className="text-3xl font-bold text-text-primary">{stats.successRate}%</p>
              </div>
              <div className="w-12 h-12 bg-accent-blue/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-green-400 font-medium">+2.1%</span>
              <span className="text-sm text-text-secondary ml-2">vs last week</span>
            </div>
          </div>

          <div className="card hover:shadow-glow-blue-sm transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Avg Duration</p>
                <p className="text-3xl font-bold text-text-primary">{stats.avgDuration}m</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-green-400 font-medium">+0.3m</span>
              <span className="text-sm text-text-secondary ml-2">vs last week</span>
            </div>
          </div>
        </div>

        {/* Recent Calls */}
        <div className="card">
          <div className="px-6 py-4 border-b border-border-gray">
            <h2 className="text-lg font-semibold text-text-primary">Recent Calls</h2>
            <p className="text-sm text-text-secondary">Live call activity and history</p>
          </div>
          <div className="divide-y divide-border-gray">
            {recentCalls.map((call) => (
              <div key={call.id} className="px-6 py-4 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      call.status === 'completed' ? 'bg-green-400' :
                      call.status === 'in-progress' ? 'bg-accent-blue animate-pulse' :
                      'bg-red-400'
                    }`}></div>
                    <div>
                      <p className="font-medium text-text-primary">{call.number}</p>
                      <p className="text-sm text-text-secondary">{call.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm font-medium text-text-primary">{call.duration}</p>
                      <p className="text-xs text-text-secondary">duration</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-text-primary capitalize">{call.status}</p>
                      <p className="text-xs text-text-secondary">status</p>
                    </div>
                    <button className="text-text-secondary hover:text-text-primary transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
