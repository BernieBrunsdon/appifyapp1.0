import React, { useState } from 'react';
import { resendEmailVerification, checkEmailVerification, signOutUser } from '../firebase/auth';

export default function EmailVerification({ userEmail, onVerified }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const result = await resendEmailVerification();
      if (result.success) {
        setMessage(result.message);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    setError('');
    setMessage('');
    
    try {
      const result = await checkEmailVerification();
      if (result.success && result.emailVerified) {
        setMessage('Email verified successfully! Redirecting...');
        console.log('✅ Email verification successful - setting flag');
        
        // Redirect directly to onboarding flow
        console.log('🔍 EmailVerification - Redirecting to onboarding flow');
        console.log('🔍 Current URL:', window.location.href);
        console.log('🔍 Will redirect to:', window.location.origin + '/onboarding');
        setTimeout(() => {
          console.log('🔍 Executing redirect now...');
          window.location.href = '/onboarding';
        }, 2000);
      } else {
        setError('Email not yet verified. Please check your inbox and click the verification link.');
      }
    } catch (error) {
      setError('Failed to check verification status. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    window.location.href = '/login';
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        backgroundPosition: 'center center'
      }}></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-4xl font-bold text-white mb-2">Appify.AI</div>
            <p className="text-gray-300">Email Verification Required</p>
          </div>

          {/* Verification Card */}
          <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
              <p className="text-gray-300">
                We've sent a verification link to:
              </p>
              <p className="text-purple-400 font-semibold mt-2">{userEmail}</p>
            </div>

            {message && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                <p className="text-green-400 text-sm">{message}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleCheckVerification}
                disabled={checking}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {checking ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Checking...
                  </div>
                ) : (
                  'I\'ve Verified My Email'
                )}
              </button>

              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full py-3 px-4 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  'Resend Verification Email'
                )}
              </button>

              <button
                onClick={handleSignOut}
                className="w-full py-2 px-4 text-gray-400 hover:text-white transition"
              >
                Sign Out
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-blue-300 font-semibold mb-1">What to do next:</h4>
                  <ul className="text-blue-200 text-sm space-y-1">
                    <li>• Check your email inbox (and spam folder)</li>
                    <li>• Click the verification link in the email</li>
                    <li>• Return here and click "I've Verified My Email"</li>
                    <li>• You'll be guided through creating your AI assistant</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}