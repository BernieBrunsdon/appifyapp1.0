import React, { useState, useEffect } from 'react';
import OnboardingModal from './OnboardingModal';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCalls: 0,
    activeCalls: 0,
    successRate: 0,
    avgDuration: 0,
    todayCalls: 0
  });

  const [recentCalls, setRecentCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [agentData, setAgentData] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  // Load agent and user data from localStorage
  useEffect(() => {
    const loadData = async () => {
      const storedAgent = localStorage.getItem('agentData');
      const storedUser = localStorage.getItem('user');
      
      // Try to get agent data from either location
      let agent = null;
      if (storedAgent) {
        try {
          agent = JSON.parse(storedAgent);
          setAgentData(agent);
        } catch (err) {
          console.error('Error parsing stored agent data:', err);
        }
      } else if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.agent) {
            agent = user.agent;
            setAgentData(agent);
          }
        } catch (err) {
          console.error('Error parsing stored user data:', err);
        }
      }
      
      // Load real stats from Vapi if we have an assistant ID
      if (agent && agent.vapiAssistantId) {
        await loadRealStats(agent.vapiAssistantId);
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  // Load real stats from Vapi API
  const loadRealStats = async (assistantId) => {
    try {
      // Get calls from Vapi API
      const callsResponse = await fetch(`https://api.vapi.ai/call?assistantId=${assistantId}`, {
        headers: {
          'Authorization': `Bearer 00c60c9f-62b3-4dd3-bede-036242a2b7c5`
        }
      });
      
      if (callsResponse.ok) {
        const callsData = await callsResponse.json();
        const calls = callsData.calls || [];
        
        // Calculate real stats
        const totalCalls = calls.length;
        const successfulCalls = calls.filter(call => call.status === 'ended' && call.endedReason === 'assistant-ended-conversation').length;
        const successRate = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0;
        const avgDuration = totalCalls > 0 ? Math.round(calls.reduce((sum, call) => sum + (call.duration || 0), 0) / totalCalls / 60) : 0;
        
        // Get today's calls
        const today = new Date().toISOString().split('T')[0];
        const todayCalls = calls.filter(call => call.createdAt && call.createdAt.startsWith(today)).length;
        
        setStats({
          totalCalls,
          activeCalls: calls.filter(call => call.status === 'in-progress').length,
          successRate,
          avgDuration,
          todayCalls
        });
        
        // Set recent calls with all data
        const processedCalls = calls.map(call => ({
          id: call.id,
          phoneNumber: call.customer?.number || 'Unknown',
          duration: call.duration || 0,
          status: call.status,
          createdAt: call.createdAt,
          endedReason: call.endedReason,
          cost: call.cost || 0
        }));
        
        setRecentCalls(processedCalls);
      }
    } catch (error) {
      console.error('❌ Error loading real stats:', error);
    }
  };

  // Helper functions

  const getStatusText = (status, endedReason) => {
    if (status === 'in-progress') return 'In Progress';
    if (status === 'ended' && endedReason === 'assistant-ended-conversation') return 'Completed';
    if (status === 'ended' && endedReason === 'customer-ended-conversation') return 'Customer Ended';
    return 'Failed';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredCalls = recentCalls.filter(call => {
    if (filter === 'all') return true;
    if (filter === 'successful') return call.status === 'ended' && call.endedReason === 'assistant-ended-conversation';
    if (filter === 'failed') return call.status === 'ended' && call.endedReason !== 'assistant-ended-conversation';
    if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return call.createdAt && call.createdAt.startsWith(today);
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!agentData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-purple-400 text-6xl mb-4">🤖</div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Appify.AI!</h2>
          <p className="text-gray-300 mb-4">Let's set up your AI assistant to get started.</p>
          <button 
            onClick={() => setShowOnboardingModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition"
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
            // Reload the component to show the dashboard
            window.location.reload();
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {agentData.agentName || 'Assistant'} Dashboard
            </h1>
            <p className="text-gray-300">
              Monitor your AI assistant's performance in real-time
            </p>
            <div className="mt-2 text-sm text-gray-400">
              Voice: {agentData.agentVoice || 'alloy'} | Phone: {agentData.assignedPhoneNumber || '+1-555-0000'} | Assistant ID: {agentData.vapiAssistantId?.substring(0, 8)}...
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-300">AI Active</span>
            </div>
            <button 
              onClick={() => window.location.href = '/settings'}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Calls</p>
                <p className="text-3xl font-bold text-white">{stats.totalCalls}</p>
                <p className="text-green-400 text-sm">+12% vs last week</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Calls</p>
                <p className="text-3xl font-bold text-white">{stats.activeCalls}</p>
                <p className="text-green-400 text-sm">Live real-time</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Success Rate</p>
                <p className="text-3xl font-bold text-white">{stats.successRate}%</p>
                <p className="text-green-400 text-sm">+2.1% vs last week</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Duration</p>
                <p className="text-3xl font-bold text-white">{stats.avgDuration}m</p>
                <p className="text-green-400 text-sm">+0.3m vs last week</p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Call Logs */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Recent Calls</h2>
                <p className="text-gray-400 text-sm">Live call activity and history</p>
              </div>
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'successful', label: 'Successful' },
                  { key: 'failed', label: 'Failed' },
                  { key: 'today', label: 'Today' }
                ].map(filterOption => (
                  <button
                    key={filterOption.key}
                    onClick={() => setFilter(filterOption.key)}
                    className={`px-3 py-1 text-xs rounded transition ${
                      filter === filterOption.key
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {filteredCalls.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📞</div>
                <p className="text-gray-400">No calls yet</p>
                <p className="text-gray-500 text-sm">Your assistant is ready to take calls!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div>
                        <p className="text-white font-medium">{call.phoneNumber}</p>
                        <p className="text-gray-400 text-sm">
                          {formatDate(call.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white">{formatDuration(call.duration)}</p>
                      <p className="text-gray-400 text-sm capitalize">{getStatusText(call.status, call.endedReason)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;