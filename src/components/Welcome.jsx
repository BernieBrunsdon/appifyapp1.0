import React from 'react';
import { Link } from 'react-router-dom';

const Welcome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">
            Appify.AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-300">
            Welcome to Your Voice AI Dashboard
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-4xl mb-4">🎤</div>
            <h3 className="text-xl font-semibold text-white mb-2">Voice AI Agent</h3>
            <p className="text-gray-300">Intelligent voice conversations with your customers</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">Call Analytics</h3>
            <p className="text-gray-300">Track performance and insights from every call</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Custom Settings</h3>
            <p className="text-gray-300">Configure your AI agent to match your business</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link 
            to="/login"
            className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Sign In to Your Account
          </Link>
          
          <div className="text-gray-400">
            Don't have an account? 
            <Link 
              to="/register" 
              className="text-purple-400 hover:text-purple-300 ml-2 font-semibold"
            >
              Create one here
            </Link>
          </div>
          
          {/* Admin Login */}
          <div className="mt-6">
            <Link 
              to="/admin"
              className="inline-block bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg text-base transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🔧 Admin Login
            </Link>
          </div>
        </div>

        {/* Back to Marketing */}
        <div className="mt-12">
          <Link 
            to="https://appifyai.com"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Marketing Site
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
