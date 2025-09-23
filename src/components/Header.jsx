import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ brand, darkMode, setDarkMode, authed, onLogout }) => {
  const location = useLocation();
  return (
    <header className="w-full flex items-center justify-between px-4 md:px-8 py-4 mb-2 rounded-b-2xl bg-gray-800/80 shadow-lg backdrop-blur-md animate-glass-blur z-30 border-b border-gray-700">
      <div className="flex items-center gap-3">
        <img src="/appifyai-logo.svg" alt="Appify Voice Agents logo" className="w-12 h-12 rounded-lg shadow" />
        <img 
          src="/screenshots/appymascot.png.png" 
          alt="Appy - The Appify AI Mascot" 
          className="w-12 h-12 object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <div className="hidden w-12 h-12 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          Appy
        </div>
        <span className="text-xl font-bold tracking-tight text-white drop-shadow">Appify Voice Agents</span>
      </div>
      <nav className="flex items-center gap-4">
        {location.pathname.startsWith('/app') && (
          <Link to="/" className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-700 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg transition-all duration-300">Back to Marketing Site</Link>
        )}
        {authed && (
          <>
            <Link to="/app" className={`px-4 py-2 rounded-xl font-semibold transition-colors duration-200 ${location.pathname === '/app' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' : 'text-gray-200 hover:bg-white/20'}`}>Voice Agent</Link>
            <Link to="/app/logs" className={`px-4 py-2 rounded-xl font-semibold transition-colors duration-200 ${location.pathname === '/app' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' : 'text-gray-200 hover:bg-white/20'}`}>Call Logs</Link>
          </>
        )}
        {authed && (
          <button onClick={onLogout} className="ml-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow transition-all duration-300">Logout</button>
        )}
      </nav>
    </header>
  );
};

export default Header; 