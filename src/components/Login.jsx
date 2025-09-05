import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Demo client map with passwords
export const CLIENT_AGENT_MAP = {
  neil: { id: 'acb59b5f-4648-4d63-b5bf-2595998b532a', password: 'neilpass' },   // Uses your correct agent
  bernie: { id: 'acb59b5f-4648-4d63-b5bf-2595998b532a', password: 'berniepass' } // Uses your correct agent
};

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [debug, setDebug] = useState('');
  const [tokenDebug, setTokenDebug] = useState('');
  const [currentToken, setCurrentToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentToken(localStorage.getItem('demo_token'));
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setDebug('');

    const { username, password } = form;
    const client = CLIENT_AGENT_MAP[username.toLowerCase()];

    if (!client) {
      setError(`User '${username}' not found. Available users: ${Object.keys(CLIENT_AGENT_MAP).join(', ')}`);
      return;
    }

    if (client.password !== password) {
      setError('Invalid password');
      return;
    }

    // Store demo token
    const token = `demo_token_${username.toLowerCase()}`;
    localStorage.setItem('demo_token', token);
    setTokenDebug(`Stored token: ${token}`);
    setDebug(`Login successful for ${username}. Agent ID: ${client.id}`);

    // Call the onLogin callback if provided
    if (onLogin) {
      onLogin({ username, agentId: client.id });
    }

    // Navigate to the app
    navigate('/app');
  };

  const handleLogout = () => {
    localStorage.removeItem('demo_token');
    setCurrentToken('');
    setTokenDebug('');
    setDebug('');
    setError('');
  };

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

      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                Appify.AI
              </h1>
              <h2 className="text-2xl font-semibold text-white">Welcome Back</h2>
              <p className="text-gray-400 mt-2">Sign in to your account</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {debug && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                  <p className="text-green-400 text-sm">{debug}</p>
                </div>
              )}

              {tokenDebug && (
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                  <p className="text-blue-400 text-sm">{tokenDebug}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition"
                >
                  Sign In
                </button>
              </div>

              {currentToken && (
                <div className="text-center">
                  <p className="text-sm text-gray-400">Currently logged in as: {currentToken.replace('demo_token_', '')}</p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 text-sm text-purple-400 hover:text-purple-300"
                  >
                    Logout
                  </button>
                </div>
              )}

              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Don't have an account?{' '}
                  <a href="/register" className="text-purple-400 hover:text-purple-300 transition">
                    Create one here
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}