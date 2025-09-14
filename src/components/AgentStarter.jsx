import React, { useState, useRef } from 'react';
import Vapi from '@vapi-ai/web';

// Hardcoded API key and Agent ID
const VAPI_API_KEY = 'YOUR_VAPI_PUBLIC_KEY';
const VAPI_AGENT_ID = 'YOUR_AGENT_ID';

const STATUS_LABELS = {
  idle: 'Idle',
  connecting: 'Connecting',
  listening: 'Listening',
  speaking: 'Speaking',
  disconnected: 'Disconnected',
};

export default function AgentStarter() {
  const [status, setStatus] = useState('idle');
  const [isCalling, setIsCalling] = useState(false);
  const vapiRef = useRef(null);

  const handleStartCall = () => {
    setStatus('connecting');
    setIsCalling(true);
    const vapi = new Vapi(VAPI_API_KEY);
    vapiRef.current = vapi;
    vapi.on('call-start', () => setStatus('listening'));
    vapi.on('speech-start', () => setStatus('speaking'));
    vapi.on('speech-end', () => setStatus('listening'));
    vapi.on('call-end', () => {
      setStatus('disconnected');
      setIsCalling(false);
    });
    vapi.on('error', () => {
      setStatus('disconnected');
      setIsCalling(false);
    });
    vapi.start(VAPI_AGENT_ID);
  };

  const handleStopCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
      setStatus('disconnected');
      setIsCalling(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">AI Agent Call</h2>
      <div className="mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${status === 'idle' ? 'bg-gray-200 text-gray-700' : status === 'connecting' ? 'bg-yellow-200 text-yellow-800' : status === 'listening' ? 'bg-blue-200 text-blue-800' : status === 'speaking' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{STATUS_LABELS[status]}</span>
      </div>
      <button
        className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors duration-200 ${isCalling ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        onClick={isCalling ? handleStopCall : handleStartCall}
      >
        {isCalling ? 'End Call' : 'Start Call'}
      </button>
    </div>
  );
} 