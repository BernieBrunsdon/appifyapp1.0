import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

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
  const [buildMsg, setBuildMsg] = useState('');
  const [stage, setStage] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      const assistantId = userData?.agent?.vapiAssistantId;
      if (!assistantId) {
        setLoading(false);
        return;
      }
      try {
        const data = await api('/api/onboarding/calls');
        const calls = data.calls || [];
        const totalCalls = calls.length;
        const successfulCalls = calls.filter(
          (c) => c.status === 'ended' && c.endedReason === 'assistant-ended-conversation'
        ).length;
        const successRate = totalCalls ? Math.round((successfulCalls / totalCalls) * 100) : 0;
        const avgDuration = totalCalls
          ? Math.round(calls.reduce((s, c) => s + (c.duration || 0), 0) / totalCalls / 60)
          : 0;
        const today = new Date().toISOString().split('T')[0];
        const todayCalls = calls.filter((c) => c.createdAt && String(c.createdAt).startsWith(today)).length;
        setStats({
          totalCalls,
          activeCalls: calls.filter((c) => c.status === 'in-progress').length,
          successRate,
          avgDuration,
          todayCalls
        });
        setRecentCalls(
          calls.map((call) => ({
            id: call.id,
            phoneNumber: call.customer?.number || call.customerPhoneNumber || 'Web Call',
            duration: call.duration || 0,
            status: call.status,
            createdAt: call.createdAt,
            endedReason: call.endedReason,
            cost: call.cost || 0
          }))
        );
        const me = await api('/api/onboarding/me');
        setStage(me.onboardingStage || '');
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [userData]);

  const submitBuild = async () => {
    try {
      const r = await api('/api/onboarding/build-request', {
        method: 'POST',
        body: JSON.stringify({ notes: '' })
      });
      setBuildMsg(r.message || 'Submitted.');
      setStage('build_requested');
    } catch (e) {
      setBuildMsg(e.message || 'Failed');
    }
  };

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
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              {userData?.agent?.agentName || 'AI Assistant'} Dashboard
            </span>
          </h1>
          <p className="text-gray-200">
            Demo agent — test below. Production setup is manual after you request a build.
          </p>
          {stage && stage !== 'build_requested' && (
            <div className="mt-4">
              <button
                type="button"
                onClick={submitBuild}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold text-white"
              >
                Build Agent
              </button>
              <p className="text-gray-400 text-sm mt-2">
                We’ll contact you to finalize phone numbers, routing, and integrations.
              </p>
            </div>
          )}
          {stage === 'build_requested' && (
            <p className="mt-4 text-green-400 text-sm">
              Build request submitted. An Appify consultant will contact you shortly.
            </p>
          )}
          {buildMsg && <p className="text-cyan-300 text-sm mt-2">{buildMsg}</p>}
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
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-cyan-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Calls</p>
                <p className="text-2xl font-bold text-white">{stats.totalCalls}</p>
                <p className="text-green-500 text-xs">+12% vs last week</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-cyan-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Calls</p>
                <p className="text-2xl font-bold text-white">{stats.activeCalls}</p>
                <p className="text-gray-500 text-xs">Live real-time</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-cyan-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-white">{stats.successRate}%</p>
                <p className="text-green-500 text-xs">+2.1% vs last week</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-cyan-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Duration</p>
                <p className="text-2xl font-bold text-white">{stats.avgDuration}m</p>
                <p className="text-green-500 text-xs">+0.3m vs last week</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Calls */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-cyan-500/20">
          <div className="p-6 border-b border-cyan-500/20">
            <h2 className="text-xl font-semibold text-white mb-2">Recent Calls</h2>
            <p className="text-gray-300 text-sm">Live call activity and history</p>
          </div>

          <div className="p-6">
            {recentCalls.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  <div key={call.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-cyan-500/10">
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