import React, { useState, useEffect } from 'react';
import calendarService from '../services/calendarService';

export default function CalendarConnection({ onConnected, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState('primary');

  useEffect(() => {
    initializeCalendar();
  }, []);

  const initializeCalendar = async () => {
    setLoading(true);
    try {
      const initialized = await calendarService.initialize();
      if (initialized && calendarService.isUserSignedIn()) {
        await loadUserData();
      }
    } catch (error) {
      setError('Failed to initialize calendar service');
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const [userInfoResult, calendarsResult] = await Promise.all([
        calendarService.getUserInfo(),
        calendarService.getCalendars()
      ]);

      if (userInfoResult) {
        setUserInfo(userInfoResult);
      }

      if (calendarsResult.success) {
        setCalendars(calendarsResult.calendars);
      }
    } catch (error) {
      setError('Failed to load calendar data');
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await calendarService.signIn();
      if (result.success) {
        await loadUserData();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to sign in to Google Calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await calendarService.signOut();
      setUserInfo(null);
      setCalendars([]);
    } catch (error) {
      setError('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    if (onConnected) {
      onConnected({
        isConnected: true,
        userInfo,
        selectedCalendar,
        calendars
      });
    }
  };

  const handleSkip = () => {
    if (onConnected) {
      onConnected({
        isConnected: false,
        userInfo: null,
        selectedCalendar: null,
        calendars: []
      });
    }
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
            <p className="text-gray-300">Connect Your Calendar</p>
          </div>

          {/* Calendar Connection Card */}
          <div className="bg-gray-800/40 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Connect Google Calendar</h2>
              <p className="text-gray-300">
                Connect your calendar to enable appointment booking and scheduling features.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {!userInfo ? (
              <div className="space-y-4">
                <button
                  onClick={handleSignIn}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg text-white font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Connecting...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Connect with Google
                    </div>
                  )}
                </button>

                <button
                  onClick={handleSkip}
                  className="w-full py-2 px-4 text-gray-400 hover:text-white transition"
                >
                  Skip for now
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* User Info */}
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    {userInfo.imageUrl && (
                      <img 
                        src={userInfo.imageUrl} 
                        alt={userInfo.name}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-white font-medium">{userInfo.name}</p>
                      <p className="text-gray-400 text-sm">{userInfo.email}</p>
                    </div>
                  </div>
                </div>

                {/* Calendar Selection */}
                {calendars.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Calendar
                    </label>
                    <select
                      value={selectedCalendar}
                      onChange={(e) => setSelectedCalendar(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {calendars.map(calendar => (
                        <option key={calendar.id} value={calendar.id}>
                          {calendar.name} {calendar.primary ? '(Primary)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleConnect}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg text-white font-semibold hover:from-green-700 hover:to-blue-700 transition"
                  >
                    Connect Calendar
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-blue-300 font-semibold mb-1">Calendar Integration Benefits</h4>
                  <ul className="text-blue-200 text-sm space-y-1">
                    <li>• Automatic appointment booking</li>
                    <li>• Real-time availability checking</li>
                    <li>• Calendar event synchronization</li>
                    <li>• Smart scheduling suggestions</li>
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