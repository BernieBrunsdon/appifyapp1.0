import React, { useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header';
import CallLogs from './components/CallLogs';
import VoiceAgentSettings from './components/VoiceAgentSettings';
import Login from './components/Login';
import Registration from './components/Registration';
import MarketingPage from './components/MarketingPage';
import Welcome from './components/Welcome';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

export const CLIENT_AGENT_MAP = {
  neil: { id: 'acb59b5f-4648-4d63-b5bf-2595998b532a', password: 'neilpass' },
  bernie: { id: 'acb59b5f-4648-4d63-b5bf-2595998b532a', password: 'berniepass' },
};

function App() {
  const [brand] = useState('Acme Corp');
  const [toast, setToast] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || false;
  });
  const [authed, setAuthed] = useState(() => !!localStorage.getItem('demo_token'));
  const [token, setToken] = useState(() => localStorage.getItem('demo_token'));
  
  // Domain detection
  const isAppDomain = window.location.hostname === 'app.appifyai.com' || 
                      (window.location.hostname === 'localhost' && window.location.search.includes('app=true'));
  const isMarketingDomain = window.location.hostname === 'appifyai.com' || 
                           window.location.hostname === 'www.appifyai.com' ||
                           (window.location.hostname === 'localhost' && !window.location.search.includes('app=true'));

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Reactively update authed/token if localStorage changes
  useEffect(() => {
    const checkToken = () => {
      const t = localStorage.getItem('demo_token');
      setToken(t);
      setAuthed(!!t);
    };
    window.addEventListener('storage', checkToken);
    const interval = setInterval(checkToken, 500);
    return () => {
      window.removeEventListener('storage', checkToken);
      clearInterval(interval);
    };
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const handleLogin = () => {
    setAuthed(true);
    setToken(localStorage.getItem('demo_token'));
  };
  
  const handleRegister = (userData) => {
    setAuthed(true);
    setToken(localStorage.getItem('demo_token'));
    showToast(`Welcome ${userData.firstName}! Your account has been created.`);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('demo_token');
    localStorage.removeItem('user');
    setAuthed(false);
    setToken('');
    showToast('You have been logged out successfully.');
  };

  // Domain-based routing
  if (isAppDomain) {
    // App subdomain - show app functionality
    return (
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className={`w-full h-full min-h-screen flex bg-gray-900 transition-colors duration-500`}>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={
              <div className="flex flex-col h-screen w-full">
                <Header brand={brand} darkMode={darkMode} setDarkMode={setDarkMode} authed={authed} onLogout={handleLogout} />
                <main className="flex-1 w-full max-w-7xl mx-auto px-2 md:px-8 fade-in py-8">
                  <Login onLogin={handleLogin} />
                </main>
              </div>
            } />
            <Route path="/register" element={
              <div className="flex flex-col h-screen w-full">
                <Header brand={brand} darkMode={darkMode} setDarkMode={setDarkMode} authed={authed} onLogout={handleLogout} />
                <main className="flex-1 w-full max-w-7xl mx-auto px-2 md:px-8 fade-in py-8">
                  <Registration onRegister={handleRegister} />
                </main>
              </div>
            } />
            <Route path="/call-logs" element={authed ? 
              <div className="flex h-screen w-full">
                <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />
                <main className="flex-1 overflow-auto">
                  <CallLogs showToast={showToast} />
                </main>
              </div>
              : <Navigate to="/login" />} />
            <Route path="/logs" element={authed ? 
              <div className="flex h-screen w-full">
                <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />
                <main className="flex-1 overflow-auto">
                  <CallLogs showToast={showToast} />
                </main>
              </div>
              : <Navigate to="/login" />} />
            <Route path="/app" element={authed ? 
              <div className="flex h-screen w-full">
                <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />
                <main className="flex-1 overflow-auto">
                  <VoiceAgentSettings showToast={showToast} />
                </main>
              </div>
              : <Navigate to="/login" />} />
            <Route path="/dashboard" element={authed ? 
              <div className="flex h-screen w-full">
                <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />
                <main className="flex-1 overflow-auto">
                  <Dashboard />
                </main>
              </div>
              : <Navigate to="/login" />} />
            <Route path="/settings" element={authed ? 
              <div className="flex h-screen w-full">
                <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />
                <main className="flex-1 overflow-auto">
                  <Settings />
                </main>
              </div>
              : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to={authed ? '/dashboard' : '/'} />} />
          </Routes>
          {toast && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in">
              {toast}
            </div>
          )}
        </div>
      </Router>
    );
  }

  // Marketing domain - show marketing page only
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className={`w-full h-full min-h-screen flex flex-col bg-gray-900 transition-colors duration-500`}>
        <Routes>
          <Route path="/" element={<MarketingPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        {toast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in">
            {toast}
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
