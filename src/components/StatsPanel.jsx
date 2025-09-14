import React from 'react';

const dummyStats = {
  totalCalls: 128,
  avgDuration: '2m 34s',
  lastCall: '2025-06-22 13:10',
};

export default function StatsPanel() {
  return (
    <div className="bg-white rounded-xl shadow p-6 w-full max-w-md mx-auto mb-6">
      <h2 className="text-lg font-semibold mb-4">Call Stats</h2>
      <div className="flex justify-between mb-2">
        <span className="text-gray-600">Total Calls</span>
        <span className="font-bold">{dummyStats.totalCalls}</span>
      </div>
      <div className="flex justify-between mb-2">
        <span className="text-gray-600">Avg Duration</span>
        <span className="font-bold">{dummyStats.avgDuration}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Last Call</span>
        <span className="font-bold">{dummyStats.lastCall}</span>
      </div>
    </div>
  );
} 