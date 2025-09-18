import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { userData } = useAuth();
  const [stats, setStats] = useState({
    totalCalls: 0,
    activeCalls: 0,
    successRate: 0,
    avgDuration: 0,
    todayCalls: 0
  });
  const [recentCalls, setRecentCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userData?.agent?.vapiAssistantId) {
        setLoading(false);
        return;
      }


      // Load real stats from Vapi API directly
      const loadRealStats = async (assistantId) => {
        try {
          
          // Get calls from Vapi API directly
          const callsResponse = await fetch(`https://api.vapi.ai/call?assistantId=${assistantId}`, {
            headers: {
              'Authorization': `Bearer ${process.env.REACT_APP_VAPI_API_KEY}`
            }
          });
          
          if (callsResponse.ok) {
            const callsData = await callsResponse.json();
            
            // Vapi API might return calls directly or in a 'calls' property
            const allCalls = callsData.calls || callsData || [];
            
            // Filter calls for this specific assistant
            const calls = allCalls.filter(call => {
              return call.assistantId === assistantId || call.assistant?.id === assistantId;
            });
            
            
            // Calculate real stats from calls
            const totalCalls = calls.length;
            const successfulCalls = calls.filter(call => call.status === 'ended' && call.endedReason === 'assistant-ended-conversation').length;
            const successRate = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0;
            const avgDuration = totalCalls > 0 ? Math.round(calls.reduce((sum, call) => sum + (call.duration || 0), 0) / totalCalls / 60) : 0;
            
            // Get today's calls
            const today = new Date().toISOString().split('T')[0];
            const todayCalls = calls.filter(call => call.createdAt && call.createdAt.startsWith(today)).length;
            
            const statsData = {
              totalCalls,
              activeCalls: calls.filter(call => call.status === 'in-progress').length,
              successRate,
              avgDuration,
              todayCalls
            };
            
            setStats(statsData);
            
            // Process calls for display
            const processedCalls = calls.map(call => ({
              id: call.id,
              phoneNumber: call.customer?.number || call.customerPhoneNumber || 'Web Call',
              duration: call.duration || 0,
              status: call.status,
              createdAt: call.createdAt,
              endedReason: call.endedReason,
              cost: call.cost || 0
            }));
            
            setRecentCalls(processedCalls);
          } else {
            console.error('❌ Failed to load call logs from Vapi:', callsResponse.status);
            const errorText = await callsResponse.text();
            console.error('❌ Error details:', errorText);
          }
        } catch (error) {
          console.error('❌ Error loading real stats:', error);
        }
      };

      await loadRealStats(userData.agent.vapiAssistantId);
      setLoading(false);
    };

    loadDashboardData();
  }, [userData]);

  // Helper functions

  const getStatusText = (status, endedReason) => {
    if (status === 'in-progress') return 'In Progress';
    if (status === 'ended' && endedReason === 'assistant-ended-conversation') return 'Completed';
    if (status === 'ended' && endedReason === 'customer-ended-call') return 'Customer Ended';
    if (status === 'ended' && endedReason === 'assistant-ended-call') return 'Assistant Ended';
    if (status === 'ended' && endedReason === 'system-ended-call') return 'System Ended';
    return 'Unknown';
  };

  const getStatusColor = (status, endedReason) => {
    if (status === 'in-progress') return 'text-blue-500';
    if (status === 'ended' && endedReason === 'assistant-ended-conversation') return 'text-green-500';
    if (status === 'ended' && endedReason === 'customer-ended-call') return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {userData?.agent?.agentName || 'AI Assistant'} Dashboard
          </h1>
          <p className="text-gray-300">
            Monitor your AI assistant's performance in real-time.
          </p>
          {userData?.agent && (
            <div className="mt-4 text-sm text-gray-400">
              <span className="mr-4">Voice: {userData.agent.agentVoice}</span>
              <span className="mr-4">Phone: {userData.agent.assignedPhoneNumber || '+1 (555) 123-4567'}</span>
              <span>Assistant ID: {userData.agent.vapiAssistantId?.slice(0, 8)}...</span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Calls</p>
                <p className="text-2xl font-bold text-white">{stats.totalCalls}</p>
                <p className="text-green-500 text-xs">+12% vs last week</p>
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
                <p className="text-2xl font-bold text-white">{stats.activeCalls}</p>
                <p className="text-gray-500 text-xs">Live real-time</p>
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
                <p className="text-2xl font-bold text-white">{stats.successRate}%</p>
                <p className="text-green-500 text-xs">+2.1% vs last week</p>
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
                <p className="text-2xl font-bold text-white">{stats.avgDuration}m</p>
                <p className="text-green-500 text-xs">+0.3m vs last week</p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Calls */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-2">Recent Calls</h2>
            <p className="text-gray-400 text-sm">Live call activity and history</p>
          </div>

          <div className="p-6">
            {recentCalls.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No calls yet</h3>
                <p className="text-gray-400">Your assistant is ready to take calls!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div>
                        <p className="text-white font-medium">{call.phoneNumber}</p>
                        <p className="text-gray-400 text-sm">{formatDate(call.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-white font-medium">{formatDuration(call.duration)}</p>
                        <p className={`text-sm ${getStatusColor(call.status, call.endedReason)}`}>
                          {getStatusText(call.status, call.endedReason)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">${(call.cost || 0).toFixed(2)}</p>
                        <p className="text-gray-400 text-sm">Cost</p>
                      </div>
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