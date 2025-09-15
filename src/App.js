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
import OnboardingModal from './components/OnboardingModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

export const CLIENT_AGENT_MAP = {
  neil: { id: 'acb59b5f-4648-4d63-b5bf-2595998b532a', password: 'neilpass' },
  bernie: { id: 'acb59b5f-4648-4d63-b5bf-2595998b532a', password: 'berniepass' },
};

// Onboarding Page Component
function OnboardingPage({ onComplete }) {
  const { userData } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-900">
      <OnboardingModal 
        isOpen={true} 
        onClose={() => {}} 
        clientData={userData}
        onComplete={(agentData) => {
          // Store agent data in localStorage
          localStorage.setItem('agentData', JSON.stringify(agentData));
          
          // Update user data with agent info
          const updatedUserData = {
            ...userData,
            agent: agentData
          };
          localStorage.setItem('user', JSON.stringify(updatedUserData));
          
          // Navigate to dashboard
          onComplete();
        }}
      />
    </div>
  );
}

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
    showToast(`Welcome ${userData.firstName || userData.displayName}! Your account has been created.`);
  };

  // Domain-based routing
  if (isAppDomain) {
    // App subdomain - show app functionality
    return (
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="w-full h-full min-h-screen flex">
          <Routes>
            <Route path="/" element={<Navigate to="/register" />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/admin" element={<AdminLogin onLogin={handleLogin} />} />
            <Route path="/register" element={<Registration onRegister={handleRegister} selectedPlan={selectedPlan} />} />
            <Route path="/verify-email" element={isAuthenticatedButUnverified ? 
              <EmailVerification userEmail={user?.email} onVerified={() => {
                // Check if user has already set up their assistant
                const storedAgentData = localStorage.getItem('agentData');
                const storedUser = localStorage.getItem('user');
                
                let hasAssistant = false;
                if (storedAgentData) {
                  try {
                    const agentData = JSON.parse(storedAgentData);
                    hasAssistant = !!(agentData.vapiAssistantId || agentData.id);
                  } catch (err) {
                    console.error('Error parsing stored agent data:', err);
                  }
                } else if (storedUser) {
                  try {
                    const userData = JSON.parse(storedUser);
                    hasAssistant = !!(userData.agent && userData.agent.vapiAssistantId);
                  } catch (err) {
                    console.error('Error parsing stored user data:', err);
                  }
                }
                
                // Redirect to assistant setup if no assistant found, otherwise to dashboard
                if (hasAssistant) {
                  window.location.href = '/dashboard';
                } else {
                  // Show onboarding modal by redirecting to a special route
                  window.location.href = '/onboarding';
                }
              }} />
              : <Navigate to="/login" />} />
            <Route path="/onboarding" element={isAuthenticated ? 
              <OnboardingPage onComplete={() => window.location.href = '/dashboard'} />
              : isAuthenticatedButUnverified ? <Navigate to="/verify-email" />
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
          {toast && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in">
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