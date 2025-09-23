import React, { useEffect, useState } from 'react';
import './App.css';
import VoiceAgentSettings from './components/VoiceAgentSettings';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import Registration from './components/Registration';
import MarketingPage from './components/MarketingPage';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import WhatsAppSettings from './components/WhatsAppSettings';
import Sidebar from './components/Sidebar';
import EmailVerification from './components/EmailVerification';
import OnboardingFlow from './components/OnboardingFlow';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

export const CLIENT_AGENT_MAP = {
  neil: { id: 'acb59b5f-4648-4d63-b5bf-2595998b532a', password: 'neilpass' },
  bernie: { id: 'acb59b5f-4648-4d63-b5bf-2595998b532a', password: 'berniepass' },
};

// App Content Component that uses auth context
function AppContent() {
  const [toast, setToast] = useState('');
  const [darkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || false;
  });
  
  // Use Firebase auth context
  const { isAuthenticated, isAuthenticatedButUnverified, user } = useAuth();
  
  // Domain detection - Clean separation
  const isAppDomain = window.location.hostname === 'app.appifyai.com' || 
                      window.location.hostname === 'appify-app.web.app';

  // Get plan parameter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const selectedPlan = urlParams.get('plan');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const handleLogin = () => {
    showToast('Welcome back!');
  };
  
  const handleRegister = (userData) => {
    if (userData.user) {
      // This is a login - navigate to dashboard
      showToast('Welcome back!');
      window.location.href = '/dashboard';
    } else {
      // This is a registration
      showToast(`Welcome ${userData.firstName || userData.displayName}! Your account has been created.`);
    }
  };

  // Domain-based routing
  if (isAppDomain) {
    // App subdomain - show app functionality
    return (
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="w-full h-full min-h-screen flex relative">
          {/* New Hero Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/screenshots/newhero.png)'
            }}
          ></div>
          
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/60"></div>
          
          {/* Subtle color overlay to enhance the image */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-indigo-900/50"></div>
          
          {/* Content with relative positioning */}
          <div className="relative z-10 w-full flex">
          <Routes>
            <Route path="/" element={<Navigate to="/register" />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/admin" element={<AdminLogin onLogin={handleLogin} />} />
            <Route path="/register" element={<Registration onRegister={handleRegister} selectedPlan={selectedPlan} />} />
            <Route path="/verify-email" element={isAuthenticatedButUnverified ? 
              <EmailVerification userEmail={user?.email} onVerified={() => {
                // EmailVerification component already set the flag, just log
                console.log('🔍 App.js - Email verification callback triggered');
                // The AuthContext will handle the redirect based on the flag set by EmailVerification
              }} />
              : <Navigate to="/login" />} />
            <Route path="/onboarding" element={(isAuthenticated || isAuthenticatedButUnverified) ? 
              <OnboardingFlow onComplete={() => window.location.href = '/dashboard'} />
              : <Navigate to="/login" />} />
            <Route path="/app" element={isAuthenticated ? 
              <div className="flex h-screen w-full">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                  <VoiceAgentSettings showToast={showToast} />
                </main>
              </div>
              : isAuthenticatedButUnverified ? <Navigate to="/verify-email" />
              : <Navigate to="/login" />} />
            <Route path="/dashboard" element={isAuthenticated ? 
              <div className="flex h-screen w-full">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                  <Dashboard />
                </main>
              </div>
              : isAuthenticatedButUnverified ? <Navigate to="/verify-email" />
              : <Navigate to="/login" />} />
            <Route path="/settings" element={isAuthenticated ? 
              <div className="flex h-screen w-full">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                  <Settings />
                </main>
              </div>
              : isAuthenticatedButUnverified ? <Navigate to="/verify-email" />
              : <Navigate to="/login" />} />
            <Route path="/whatsapp" element={isAuthenticated ? 
              <div className="flex h-screen w-full">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                  <WhatsAppSettings />
                </main>
              </div>
              : isAuthenticatedButUnverified ? <Navigate to="/verify-email" />
              : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : isAuthenticatedButUnverified ? '/verify-email' : '/register'} />} />
          </Routes>
          </div>
          {toast && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in">
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

// Main App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;