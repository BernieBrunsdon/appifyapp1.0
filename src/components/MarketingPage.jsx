import React, { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import DemoBookingModal from './DemoBookingModal';

// Vapi Configuration
const VAPI_PUBLIC_KEY = 'bafbc489-8d6c-474b-a23f-a735d3862720';
const VAPI_ASSISTANT_ID = 'acb59b5f-4648-4d63-b5bf-2595998b532a';
const REST_API_KEY = '00c60c9f-62b3-4dd3-bede-036242a2b7c5';

const tiers = [
  {
    name: 'Basic Plan',
    price: '$249/mo',
    setupCost: '$99',
    features: [
      'Intelligent AI human-like call answering',
      'Full access to APPY (Appify App)',
      'Basic customization (Accent control, personality, basic FAQ)',
      'Basic call routing (Transfer to one number)',
      'Business hours configuration',
      'Fully custom jewelry inventory and business details',
      'Knowledge base',
      '1 business phone number (or bring your own)',
      'Call filtering to divert unwanted calls to email',
      '500 minutes included',
      'Overage: $0.25/minute'
    ],
    idealFor: 'Local shops, solo practitioners, or small offices',
    setupTime: '2-3 business days',
    paypalAmount: '249.00',
    paypalItem: 'AppifyAI Basic Plan',
  },
  {
    name: 'Pro Plan',
    price: '$499/mo',
    setupCost: '$199',
    features: [
      'Everything in Basic, plus:',
      'Advanced call routing (multiple numbers, ring groups, departments)',
      'Automated email + SMS follow-ups',
      'CRM integrations (HubSpot, Salesforce, Zoho)',
      'Appointment booking automation (Google/Outlook sync)',
      'Priority setup (1-2 business days)',
      'Expanded knowledge base (industry-specific FAQs)',
      'Call analytics dashboard',
      '3 business numbers included (or BYO)',
      '1,500 minutes included',
      'Overage: $0.20/minute'
    ],
    idealFor: 'Law firms, agencies, medical practices, e-commerce businesses',
    setupTime: '1-2 business days',
    paypalAmount: '499.00',
    paypalItem: 'AppifyAI Pro Plan',
  },
  {
    name: 'Premium / Enterprise',
    price: '$999+/mo',
    setupCost: '$499',
    features: [
      'Everything in Pro, plus:',
      'Full multi-channel AI receptionist (voice, SMS, email, web chat)',
      'Custom AI workflows (lead qualification, sales scripts, order taking)',
      'Deep integrations (Slack, Teams, custom CRMs, Zapier)',
      'Dedicated account manager + premium support',
      'Call recording + AI-powered summaries',
      'Role-based access for teams',
      'API access for custom automation',
      '10 business numbers included (local or toll-free)',
      '5,000 minutes included',
      'Overage: $0.15/minute'
    ],
    idealFor: 'Enterprises, call-heavy businesses, franchises, SaaS companies',
    setupTime: '2-5 business days',
    paypalAmount: '999.00',
    paypalItem: 'AppifyAI Premium Plan',
  },
];

export default function MarketingPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // 'idle', 'starting', 'in-call'
  const [vapiClient, setVapiClient] = useState(null);
  const [vapiLoaded, setVapiLoaded] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm the Appify AI assistant. I can help you learn about our Voice AI solutions, pricing, features, or book a demo. What would you like to know?",
      isAI: true
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const vapiRef = useRef(null);

  // Initialize Vapi SDK
  useEffect(() => {
    const initVapi = () => {
      console.log('🔍 Initializing Vapi SDK...');
      
      try {
        console.log('✅ Vapi SDK found, creating client...');
        const client = new Vapi(VAPI_PUBLIC_KEY);
        
        // Set up event listeners
        client.on('call-start', () => {
          console.log('📞 Call started');
          setCallStatus('in-call');
        });
        
        client.on('call-end', () => {
          console.log('📞 Call ended');
          setCallStatus('idle');
        });
        
        client.on('call-error', (error) => {
          console.error('❌ Call error:', error);
          setCallStatus('idle');
        });
        
        setVapiClient(client);
        vapiRef.current = client;
        setVapiLoaded(true);
        console.log('✅ Vapi client initialized successfully');
      } catch (error) {
        console.error('❌ Error creating Vapi client:', error);
        setVapiLoaded(true); // Set to true even if there's an error to show the button
      }
    };

    // Initialize immediately
    initVapi();
  }, []);

  // Start the call
  const startCall = () => {
    if (callStatus !== 'idle') return;
    
    console.log('🎤 Starting call with assistant:', VAPI_ASSISTANT_ID);
    setCallStatus('starting');
    
    if (!vapiClient) {
      console.error('❌ Vapi client not available');
      setCallStatus('idle');
      alert('Voice call not available. Vapi SDK failed to load. Please refresh the page and try again.');
      return;
    }
    
    try {
      if (typeof vapiClient.start === 'function') {
        vapiClient.start(VAPI_ASSISTANT_ID);
        console.log('✅ Call started successfully');
        
        // Set a timeout to show error if call doesn't start
        setTimeout(() => {
          if (callStatus === 'starting') {
            console.error('❌ Call timeout - no response from Vapi');
            setCallStatus('idle');
            alert('Call failed to start. Please check your microphone permissions and try again.');
          }
        }, 10000); // 10 second timeout
      } else {
        console.error('❌ start function not available');
        setCallStatus('idle');
        alert('Voice call not available. Vapi SDK not properly loaded.');
      }
    } catch (error) {
      console.error('❌ Error starting call:', error);
      setCallStatus('idle');
      alert('Failed to start call. Please check your microphone permissions and try again.');
    }
  };

  // End the call
  const endCall = () => {
    if (callStatus !== 'in-call') return;
    
    console.log('📞 Ending call');
    try {
      // Try different methods to end the call
      if (vapiClient) {
        if (typeof vapiClient.stop === 'function') {
          console.log('🛑 Using stop() method');
          vapiClient.stop();
        } else if (typeof vapiClient.hangup === 'function') {
          console.log('🛑 Using hangup() method');
        vapiClient.hangup();
        } else if (typeof vapiClient.end === 'function') {
          console.log('🛑 Using end() method');
          vapiClient.end();
        } else {
          console.error('❌ No end call method available');
          setCallStatus('idle');
        }
      } else if (vapiRef.current) {
        if (typeof vapiRef.current.stop === 'function') {
          console.log('🛑 Using stop() method (ref)');
          vapiRef.current.stop();
        } else if (typeof vapiRef.current.hangup === 'function') {
          console.log('🛑 Using hangup() method (ref)');
        vapiRef.current.hangup();
        } else if (typeof vapiRef.current.end === 'function') {
          console.log('🛑 Using end() method (ref)');
          vapiRef.current.end();
        } else {
          console.error('❌ No end call method available (ref)');
          setCallStatus('idle');
        }
      } else {
        console.error('❌ No Vapi client available');
        setCallStatus('idle');
      }
      
      // Fallback: Force status reset after 2 seconds if Vapi event doesn't fire
      setTimeout(() => {
        if (callStatus === 'in-call') {
          console.log('⚠️ Forcing call status reset - Vapi event may not have fired');
          setCallStatus('idle');
        }
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error ending call:', error);
      setCallStatus('idle');
    }
  };

  // Toggle call (start or end)
  const toggleCall = () => {
    console.log('🔄 Toggle call called, current status:', callStatus);
    
    if (callStatus === 'idle') {
      console.log('🚀 Starting call...');
      startCall();
    } else if (callStatus === 'in-call') {
      console.log('🛑 Ending call...');
      endCall();
    } else {
      console.log('⚠️ Call in progress, ignoring click');
    }
  };

  // Handle chat input
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = {
      id: Date.now(),
      text: chatInput,
      isAI: false
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setChatLoading(true);

    try {
      // Call Vapi Chat API with the same assistant used for voice calls
      const response = await fetch('https://api.vapi.ai/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REST_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: currentInput,
          assistantId: VAPI_ASSISTANT_ID,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract the AI response from Vapi
      let aiResponse = '';
      if (data.output && data.output.length > 0) {
        // Get the last message from the output
        const lastMessage = data.output[data.output.length - 1];
        aiResponse = lastMessage.message || lastMessage.content || 'I received your message but couldn\'t generate a response.';
      } else if (data.message) {
        aiResponse = data.message;
      } else {
        aiResponse = 'I received your message but couldn\'t generate a response.';
      }

      const responseMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        isAI: true
      };
      setChatMessages(prev => [...prev, responseMessage]);
      
    } catch (error) {
      console.error('Vapi Chat API error:', error);
      const errorResponse = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting to my AI brain right now. Please try again or contact us directly at bernie@appifyai.com",
        isAI: true
      };
      setChatMessages(prev => [...prev, errorResponse]);
    } finally {
      setChatLoading(false);
    }
  };

  const demoMailTo = (subjectSuffix = 'Book a Demo') => {
    const subject = encodeURIComponent(`AppifyAI — ${subjectSuffix}`);
    const body = encodeURIComponent(
      `Hi AppifyAI Team,%0D%0A%0D%0A` +
      `I would like to book a demo.%0D%0A%0D%0A` +
      (name ? `Name: ${name}%0D%0A` : '') +
      (email ? `Email: ${email}%0D%0A` : '') +
      (message ? `Message: ${message}%0D%0A` : '') +
      `%0D%0AThank you!`
    );
    return `mailto:bernie@appifyai.com?subject=${subject}&body=${body}`;
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    window.location.href = demoMailTo('Contact Form Submission');
    setSubmitted(true);
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

      <div className="relative z-10">
        {/* Navigation Bar */}
        <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center py-6 px-4 md:px-8">
          <div className="text-3xl font-bold text-white">
            Appify.AI
          </div>
          <nav className="flex items-center space-x-6">
            <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</a>
            <a href="#contact" className="text-gray-300 hover:text-white transition">Contact</a>
            <a href="https://app.appifyai.com" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white hover:from-purple-700 hover:to-blue-700 transition font-semibold">
              Get Started
            </a>
            {/* Development Mode Toggle */}
            {window.location.hostname === 'localhost' && (
              <a 
                href="?app=true" 
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white text-sm font-semibold transition"
                title="Switch to App View (Development Mode)"
              >
                🛠 App View
              </a>
            )}
          </nav>
        </header>

        {/* Hero Section */}
        <main className="pt-48 pb-16 md:pt-56 md:pb-24 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
            Automate Your Business with <br /> 
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Intelligent Voice AI
            </span>
          </h1>
          <p className="mt-8 max-w-3xl mx-auto text-xl text-gray-300">
            We build custom voice AI agents to answer calls, book appointments, and qualify leads, so you can focus on growing your business.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-6">
            <a href="https://app.appifyai.com" className="w-full sm:w-auto px-10 py-5 text-lg font-semibold text-white rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition transform hover:scale-105">Start Free Trial</a>
            <button onClick={() => setShowDemoModal(true)} className="w-full sm:w-auto px-10 py-5 text-lg font-semibold text-white rounded-lg border-2 border-white/30 hover:bg-white/10 transition transform hover:scale-105">Book A Demo</button>
          </div>
          <div className="mt-8 flex justify-center items-center space-x-2 text-gray-300 text-base">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>No Credit or Debit Card Required</span>
          </div>

          {/* Voice Agent Section - Below Hero */}
          <div className="mt-80">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Speak to Appy Live</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">Click the button below to start a live voice conversation with our AI assistant. Ask it anything about our services!</p>
          <div className="mt-12 flex flex-col items-center gap-6">
            <div className="relative w-48 h-48 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              {/* Animated rings */}
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute inset-0 rounded-full border-2 border-green-500/30 animate-pulse" style={{animationDelay: '2s'}}></div>
              
              {/* Main button */}
              <button 
                onClick={toggleCall}
                disabled={callStatus === 'starting' || !vapiLoaded}
                className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 ${
                  callStatus === 'in-call' 
                    ? 'bg-red-500/80 border-2 border-red-400 hover:bg-red-600/80 animate-pulse' 
                    : callStatus === 'starting'
                    ? 'bg-yellow-500/80 border-2 border-yellow-400 animate-pulse'
                    : 'bg-gray-800/60 border-2 border-gray-600 hover:border-purple-500 hover:scale-105'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {callStatus === 'in-call' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6v6H9z" />
                  </svg>
                ) : callStatus === 'starting' ? (
                  <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
        </div>
            
            {/* Status text with animation */}
            <div className="text-center">
              <p className={`text-lg font-semibold h-8 transition-all duration-300 ${
                !vapiLoaded ? 'text-yellow-400 animate-pulse' :
                callStatus === 'idle' ? 'text-green-400' :
                callStatus === 'starting' ? 'text-yellow-400 animate-pulse' :
                callStatus === 'in-call' ? 'text-red-400 animate-pulse' :
                'text-gray-400'
              }`}>
                {!vapiLoaded && '🔄 Loading Vapi SDK...'}
                {vapiLoaded && callStatus === 'idle' && '🎤 Click the mic to start'}
                {callStatus === 'starting' && '⏳ Starting call...'}
                {callStatus === 'in-call' && '📞 Call Active - Speak Now!'}
              </p>
              
              {/* Loading dots animation */}
              {!vapiLoaded && (
                <div className="flex justify-center mt-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              </div>
              )}
            </div>
          </div>
          </div>
        </main>

        {/* AI Agent Chat Section */}
        <section id="ai-agent" className="py-10 md:py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">...Or Type to our AI Assistant</h2>
            <p className="mt-4 text-lg text-gray-400">Have questions about our Voice AI solutions, features, or pricing? Appify's AI agent is here to help you 24/7.</p>
          </div>
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="bg-gray-800/40 border border-gray-700 rounded-lg shadow-2xl flex flex-col h-96">
              <div className="p-6 flex-grow overflow-y-auto space-y-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex items-start gap-3 ${msg.isAI ? 'justify-start' : 'justify-end'}`}>
                    {msg.isAI && (
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white">AI</div>
                    )}
                    <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.isAI ? 'bg-gray-700 text-gray-200' : 'bg-blue-600 text-white'}`}>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    {!msg.isAI && (
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold text-white">U</div>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-start gap-3 justify-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white">AI</div>
                    <div className="bg-gray-700 text-gray-200 px-4 py-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-700 flex items-center gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatLoading}
                  className="flex-grow bg-gray-700 border-gray-600 rounded-md py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                  placeholder={chatLoading ? "AI is thinking..." : "Type your question..."}
                />
                <button 
                  type="submit" 
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {chatLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    'Send'
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* AI Solutions Section - Revamped with App Screenshots */}
        <section id="features" className="py-20 md:py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                The Complete <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">AI Business Suite</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Everything you need to automate your business operations with intelligent voice AI. 
                See your dashboard, manage calls, and configure your AI assistant - all in one powerful platform.
              </p>
            </div>

            {/* App Screenshots Showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {/* Dashboard Screenshot */}
              <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300">
                <div className="bg-gray-900 rounded-lg p-4 mb-4 shadow-2xl overflow-hidden">
                  <img 
                    src="/screenshots/dashboard.png.png" 
                    alt="Appify.AI Dashboard - Real-time AI agent monitoring with call metrics and voice controls"
                    className="w-full h-auto rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="hidden bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">AI Agent Dashboard</h3>
                      <span className="text-sm bg-white/20 px-2 py-1 rounded">Live</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded p-3 text-center">
                        <div className="text-2xl font-bold">0</div>
                        <div className="text-xs opacity-80">Total Calls</div>
                      </div>
                      <div className="bg-white/10 rounded p-3 text-center">
                        <div className="text-2xl font-bold">0%</div>
                        <div className="text-xs opacity-80">Success Rate</div>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full mx-auto flex items-center justify-center">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <p className="text-sm mt-2">Click to start call</p>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Real-Time Dashboard</h3>
                <p className="text-gray-400 text-sm">Monitor your AI agent's performance with live metrics, call analytics, and instant controls.</p>
              </div>

              {/* Call Logs Screenshot */}
              <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300">
                <div className="bg-gray-900 rounded-lg p-4 mb-4 shadow-2xl overflow-hidden">
                  <img 
                    src="/screenshots/call-logs.png.png" 
                    alt="Appify.AI Call Logs - Detailed call analytics with success rates, duration, and cost tracking"
                    className="w-full h-auto rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="hidden bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">Call Logs</h3>
                      <span className="text-sm bg-purple-600 text-white px-2 py-1 rounded">100 Calls</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">df6c4541-2...</span>
                        <span className="text-green-400">27s</span>
                        <span className="text-white">$0.03</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">a8b2c9d1-4...</span>
                        <span className="text-green-400">45s</span>
                        <span className="text-white">$0.06</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">e7f3g8h2-1...</span>
                        <span className="text-green-400">32s</span>
                        <span className="text-white">$0.04</span>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Complete Call Analytics</h3>
                <p className="text-gray-400 text-sm">Track every call with detailed logs, success rates, duration, and cost analysis.</p>
              </div>

              {/* Settings Screenshot */}
              <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-all duration-300">
                <div className="bg-gray-900 rounded-lg p-4 mb-4 shadow-2xl overflow-hidden">
                  <img 
                    src="/screenshots/settings.png.png" 
                    alt="Appify.AI Settings - AI assistant configuration with voice, model, and knowledge base settings"
                    className="w-full h-auto rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="hidden bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">AI Assistant Settings</h3>
                      <button className="bg-purple-600 text-white px-4 py-2 rounded text-sm">Save Settings</button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600">Assistant Name</label>
                        <input className="w-full border rounded p-2 text-sm" placeholder="My AI Assistant" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Voice</label>
                        <select className="w-full border rounded p-2 text-sm">
                          <option>Alloy (Neutral)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Creativity Level: 0.7</label>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{width: '70%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Custom AI Configuration</h3>
                <p className="text-gray-400 text-sm">Personalize your AI agent's voice, personality, and knowledge base for your business.</p>
              </div>

              {/* Interactive Dashboard Screenshot */}
              <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700 hover:border-yellow-500 transition-all duration-300">
                <div className="bg-gray-900 rounded-lg p-4 mb-4 shadow-2xl overflow-hidden">
                  <img 
                    src="/screenshots/interactive-dashboard.png.png" 
                    alt="Appify.AI Interactive Dashboard - Advanced analytics with real-time data visualization and interactive controls"
                    className="w-full h-auto rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="hidden bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">Interactive Dashboard</h3>
                      <span className="text-sm bg-white/20 px-2 py-1 rounded">Live Data</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded p-3 text-center">
                        <div className="text-2xl font-bold">1,240</div>
                        <div className="text-xs opacity-80">Total Calls</div>
                      </div>
                      <div className="bg-white/10 rounded p-3 text-center">
                        <div className="text-2xl font-bold">92.5%</div>
                        <div className="text-xs opacity-80">Success Rate</div>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full mx-auto flex items-center justify-center">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <p className="text-sm mt-2">Interactive Analytics</p>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Interactive Analytics</h3>
                <p className="text-gray-400 text-sm">Advanced dashboard with real-time data visualization, interactive charts, and detailed performance metrics.</p>
              </div>
            </div>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Instant Setup</h3>
                <p className="text-gray-400 text-sm">Get your AI agent running in minutes, not weeks</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Real-Time Analytics</h3>
                <p className="text-gray-400 text-sm">Track performance with detailed insights and reports</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">24/7 Availability</h3>
                <p className="text-gray-400 text-sm">Never miss a call with round-the-clock AI coverage</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 00-1.066 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Easy Customization</h3>
                <p className="text-gray-400 text-sm">Configure voice, personality, and knowledge base in minutes</p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center mt-16">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to Transform Your Business?
              </h3>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of businesses already using Appify.AI to automate their operations and grow their revenue.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <a href="https://app.appifyai.com" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition transform hover:scale-105">
                  Start Free Trial
                </a>
                <button onClick={() => setShowDemoModal(true)} className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition">
                  Book Demo
                </button>
              </div>
      </div>
          </div>
      </section>

        {/* Reviews Section */}
        <section id="reviews" className="py-20 md:py-24 px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center">Loved by Teams Worldwide</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400 text-center">Don't just take our word for it. Here's what our customers have to say.</p>
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-gray-800/40 p-8 rounded-lg border border-gray-700">
              <p className="text-gray-300">"Appify.AI's voice agent has been a game-changer. We're capturing leads 24/7."</p>
              <div className="flex items-center mt-6">
                <p className="font-semibold text-white">Dr. Jane Smith</p>
              </div>
            </div>
            <div className="bg-gray-800/40 p-8 rounded-lg border border-gray-700">
              <p className="text-gray-300">"As a law firm, every call is critical. We used to miss calls after hours. Not anymore."</p>
              <div className="flex items-center mt-6">
                <p className="font-semibold text-white">Michael Doe</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-24 text-center px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Choose the Right Plan for You</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">Simple, transparent pricing that scales with your needs.</p>
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto text-left">
            {tiers.map((tier, index) => (
              <div key={tier.name} className={`bg-gray-800/40 p-8 rounded-lg border flex flex-col ${index === 1 ? 'border-2 border-purple-500 relative' : 'border-gray-700'}`}>
                {index === 1 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
                <p className="mt-4 text-4xl font-extrabold text-white">{tier.price}</p>
                <p className="text-sm text-gray-400">Setup: {tier.setupCost}</p>
                <p className="text-sm text-gray-400 mb-6">{tier.setupTime}</p>
                <ul className="space-y-3 text-gray-300 flex-grow">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <span className="text-green-400 mr-3 mt-1">✓</span>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 bg-gray-700/30 p-4 rounded-md">
                  <p className="font-semibold text-white flex items-center">
                    <svg className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Ideal for:
                  </p>
                  <p className="text-gray-400 text-sm mt-1">{tier.idealFor}</p>
                </div>
                <a 
                  href={`https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=herschelgomez@xyzzyu.com&item_name=${tier.paypalItem}&amount=${tier.paypalAmount}&currency_code=USD`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-8 w-full block text-center px-6 py-3 font-semibold text-black rounded-lg bg-yellow-400 hover:bg-yellow-500 transition"
                >
                  Buy Now
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 md:py-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Ready to Get Started?</h2>
            <p className="mt-4 text-lg text-gray-400">Book a demo or drop us a line. We'd love to hear from you.</p>
          </div>
          <div className="mt-12 max-w-xl mx-auto">
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <input 
                type="text" 
                placeholder="Your Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full bg-gray-800/60 border border-gray-600 rounded-md py-3 px-4 text-white placeholder-gray-400"
              />
              <input 
                type="email" 
                placeholder="Your Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full bg-gray-800/60 border border-gray-600 rounded-md py-3 px-4 text-white placeholder-gray-400"
              />
              <textarea 
                rows="4" 
                placeholder="Describe your business..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="block w-full bg-gray-800/60 border border-gray-600 rounded-md py-3 px-4 text-white placeholder-gray-400"
              ></textarea>
              <div className="flex flex-col sm:flex-row gap-4">
                <button type="submit" className="w-full sm:w-1/2 px-8 py-4 font-semibold text-white rounded-lg border border-gray-600 hover:bg-gray-800 transition">Send Message</button>
                <button type="button" onClick={() => setShowDemoModal(true)} className="w-full sm:w-1/2 px-8 py-4 font-semibold text-white rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition">Book a Demo</button>
          </div>
            {submitted && (
                <p className="text-green-400 text-sm">Opening your email client… If it didn't open, click "Book a Demo".</p>
            )}
            </form>
          </div>
      </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-8">
          <div className="container mx-auto px-4 md:px-8">
            <p className="text-center text-gray-400">&copy; 2025 Appify.AI. All rights reserved.</p>
          </div>
        </footer>
      </div>
      
      {/* Demo Booking Modal */}
      <DemoBookingModal 
        isOpen={showDemoModal} 
        onClose={() => setShowDemoModal(false)} 
      />
    </div>
  );
} 