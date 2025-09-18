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
          className="w-10 h-10 object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <div className="hidden w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
          Appy
        </div>
        <span className="text-2xl font-bold tracking-tight text-white drop-shadow">Appify Voice Agents</span>
      </div>
      <nav className="flex items-center gap-4">
        {location.pathname.startsWith('/app') && (
          <Link to="/" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-colors">Back to Marketing Site</Link>
        )}
        {authed && (
          <>
            <Link to="/app" className={`px-4 py-2 rounded-xl font-semibold transition-colors duration-200 ${location.pathname === '/app' ? 'bg-blue-500 text-white' : 'text-gray-200 hover:bg-gray-700'}`}>Voice Agent</Link>
            <Link to="/app/logs" className={`px-4 py-2 rounded-xl font-semibold transition-colors duration-200 ${location.pathname === '/app' ? 'bg-blue-500 text-white' : 'text-gray-200 hover:bg-gray-700'}`}>Call Logs</Link>
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