import React, { useEffect, useState } from 'react';
import './App.css';
import VoiceAgentSettings from './components/VoiceAgentSettings';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import Registration from './components/Registration';
import MarketingPage from './components/MarketingPage';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import EmailVerification from './components/EmailVerification';
import OnboardingFlow from './components/OnboardingFlow';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

export const CLIENT_AGENT_MAP = {
  neil: { id: 'acb59b5f-4648-4d63-b5bf-2595998b532a', password: 'neilpass' },
  bernie: { id: 'acb59b5f-4648-4d63-b5bf-2595998b532a', password: 'berniepass' },
};

function AppContent() {
  const [toast, setToast] = useState('');
  const [darkMode] = useState(() => localStorage.getItem('darkMode') === 'true' || false);
  const { isAuthenticated, isAuthenticatedButUnverified, user } = useAuth();

  // CRITICAL: appifyai.com / www must ALWAYS be marketing. Do not use REACT_APP_APP_SHELL alone for
  // production — if APP_SHELL=1 is baked in from .env.local during `npm run build`, every host would
  // show register. App shell only on app subdomain, or localhost when developing the app.
  const host = window.location.hostname;
  const isLocalAppDev =
    (host === 'localhost' || host === '127.0.0.1') && process.env.REACT_APP_APP_SHELL === '1';
  const isAppDomain = host === 'app.appifyai.com' || isLocalAppDev;

  const urlParams = new URLSearchParams(window.location.search);
  const selectedPlan = urlParams.get('plan');

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleLogin = () => showToast('Welcome back!');
  const handleRegister = (userData) => {
    if (userData?.user) {
      showToast('Welcome back!');
      window.location.href = '/onboarding';
    } else {
      showToast(`Welcome ${userData?.firstName || userData?.displayName || ''}!`);
    }
  };

  if (isAppDomain) {
    return (
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="w-full h-full min-h-screen flex relative">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/screenshots/newhero.png)' }}
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-indigo-900/50" />
          <div className="relative z-10 w-full flex">
            <Routes>
              <Route path="/" element={<Navigate to="/register" replace />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/admin" element={<AdminLogin onLogin={handleLogin} />} />
              <Route
                path="/register"
                element={<Registration onRegister={handleRegister} selectedPlan={selectedPlan} />}
              />
              <Route
                path="/verify-email"
                element={
                  isAuthenticatedButUnverified ? (
                    <EmailVerification
                      userEmail={user?.email}
                      onVerified={() => console.log('verified')}
                    />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/onboarding"
                element={
                  isAuthenticated ? (
                    <OnboardingFlow onComplete={() => (window.location.href = '/dashboard')} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/app"
                element={
                  isAuthenticated ? (
                    <div className="flex h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 overflow-auto">
                        <VoiceAgentSettings showToast={showToast} />
                      </main>
                    </div>
                  ) : isAuthenticatedButUnverified ? (
                    <Navigate to="/verify-email" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/dashboard"
                element={
                  isAuthenticated ? (
                    <div className="flex h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 overflow-auto">
                        <Dashboard />
                      </main>
                    </div>
                  ) : isAuthenticatedButUnverified ? (
                    <Navigate to="/verify-email" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/settings"
                element={
                  isAuthenticated ? (
                    <div className="flex h-screen w-full">
                      <Sidebar />
                      <main className="flex-1 overflow-auto">
                        <Settings />
                      </main>
                    </div>
                  ) : isAuthenticatedButUnverified ? (
                    <Navigate to="/verify-email" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="*"
                element={
                  <Navigate
                    to={
                      isAuthenticated
                        ? '/dashboard'
                        : isAuthenticatedButUnverified
                          ? '/verify-email'
                          : '/register'
                    }
                    replace
                  />
                }
              />
            </Routes>
          </div>
          {toast && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg z-50">
              {toast}
            </div>
          )}
        </div>
      </Router>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="w-full h-full min-h-screen flex flex-col bg-gray-900 transition-colors duration-500">
        <Routes>
          <Route path="/" element={<MarketingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {toast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg z-50">
            {toast}
          </div>
        )}
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
