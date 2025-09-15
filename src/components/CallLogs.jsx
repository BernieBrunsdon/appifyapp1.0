import React, { useState, useEffect } from 'react';

const CallLogs = ({ showToast }) => {
  const [calls, setCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [agentData, setAgentData] = useState(null);
  const [filter, setFilter] = useState('all'); // all, successful, failed, today

  useEffect(() => {
    loadCallLogs();
  }, []);

  const loadCallLogs = async () => {
    try {
      setIsLoading(true);
      
      // Get agent data
      const storedAgent = localStorage.getItem('agentData');
      const storedUser = localStorage.getItem('user');
      
      let agent = null;
      if (storedAgent) {
        agent = JSON.parse(storedAgent);
      } else if (storedUser) {
        const user = JSON.parse(storedUser);
        agent = user.agent;
      }
      
      if (!agent || !agent.vapiAssistantId) {
        console.warn('No agent data found');
        setCalls([]);
        setIsLoading(false);
        return;
      }
      
      setAgentData(agent);
      
      // Get calls from Vapi API
      const response = await fetch(`https://api.vapi.ai/call?assistantId=${agent.vapiAssistantId}`, {
        headers: {
          'Authorization': `Bearer 00c60c9f-62b3-4dd3-bede-036242a2b7c5`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const allCalls = data.calls || [];
        
        // Process calls data
        const processedCalls = allCalls.map(call => ({
          id: call.id,
          phoneNumber: call.customer?.number || 'Unknown',
          duration: call.duration || 0,
          status: call.status,
          endedReason: call.endedReason,
          createdAt: call.createdAt,
          cost: call.cost || 0,
          transcript: call.transcript || 'No transcript available'
        }));
        
        setCalls(processedCalls);
        console.log('✅ Loaded call logs:', processedCalls.length);
      } else {
        console.error('Failed to load call logs:', response.status);
        showToast('Failed to load call logs');
      }
    } catch (error) {
      console.error('Error loading call logs:', error);
      showToast('Error loading call logs');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status, endedReason) => {
    if (status === 'in-progress') return 'bg-blue-500';
    if (status === 'ended' && endedReason === 'assistant-ended-conversation') return 'bg-green-500';
    if (status === 'ended' && endedReason === 'customer-ended-conversation') return 'bg-yellow-500';
    return 'bg-red-500';
  };

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

  const filteredCalls = calls.filter(call => {
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
          <p className="text-gray-300">Loading call logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Call Logs</h1>
            <p className="text-gray-300">
              {agentData ? `${agentData.agentName} - ${calls.length} total calls` : 'No assistant configured'}
            </p>
          </div>
          <button 
            onClick={loadCallLogs}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-4">
            {[
              { key: 'all', label: 'All Calls' },
              { key: 'successful', label: 'Successful' },
              { key: 'failed', label: 'Failed' },
              { key: 'today', label: 'Today' }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-4 py-2 rounded-lg transition ${
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

        {/* Call Logs Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          {filteredCalls.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📞</div>
              <h3 className="text-xl font-bold text-white mb-2">No Calls Found</h3>
              <p className="text-gray-400">
                {filter === 'all' 
                  ? "No calls have been made yet. Your assistant is ready to take calls!"
                  : `No ${filter} calls found.`
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Cost
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredCalls.map((call) => (
                    <tr key={call.id} className="hover:bg-gray-700 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                          <span className="text-white font-medium">{call.phoneNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatDuration(call.duration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(call.status, call.endedReason)}`}>
                          {getStatusText(call.status, call.endedReason)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatDate(call.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        ${call.cost.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallLogs;