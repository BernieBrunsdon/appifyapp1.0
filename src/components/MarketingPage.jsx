import React, { useState, useEffect, useRef } from 'react';
import { getAppUrl } from '../utils/urlHelper';
import Vapi from '@vapi-ai/web';
import DemoBookingModal from './DemoBookingModal';

// FAQ Item Component
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-800/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-text-primary font-medium">{question}</span>
        <svg
          className={`w-5 h-5 text-green-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <div className="border-t border-border-gray pt-4">
            <p className="text-text-secondary leading-relaxed">{answer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Vapi Configuration
const VAPI_PUBLIC_KEY = '1982777e-4159-4b67-981d-4a99ae5faf31'; // Updated public key with all assistants permission
const VAPI_ASSISTANT_ID = '7b950f50-7a8b-4371-a508-acb2d4dd5c7c'; // Use the working dylan assistant ID
const REST_API_KEY = '00c60c9f-62b3-4dd3-bede-036242a2b7c5';

const tiers = [
  {
    name: 'Free Plan',
    price: 'Free',
    setupCost: 'Free',
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
      '100 minutes included',
      'Overage: $0.25/minute'
    ],
    idealFor: 'Local shops, solo practitioners, or small offices',
    setupTime: '2-3 business days',
    paypalAmount: '0.00',
    paypalItem: 'AppifyAI Free Plan',
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
    <div className="min-h-screen relative overflow-hidden gradient-bg-professional">
      <div className="relative z-10">
        {/* Navigation Bar */}
        <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center py-6 px-4 md:px-8">
          <div className="text-3xl font-bold text-text-primary font-inter">
            Appify.AI
          </div>
          <nav className="flex items-center space-x-6">
            <a href="#features" className="text-text-secondary hover:text-text-primary transition-colors duration-300">Features</a>
            <a href="#pricing" className="text-text-secondary hover:text-text-primary transition-colors duration-300">Pricing</a>
            <a href="#contact" className="text-text-secondary hover:text-text-primary transition-colors duration-300">Contact</a>
            <a href={getAppUrl("/register")} className="btn-ghost">
              Get Started
            </a>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="pt-48 pb-16 md:pt-56 md:pb-24 text-center px-4">
          <h1 className="text-5xl md:text-7xl heading-primary leading-tight">
            Automate Your Business with <br /> 
            <span className="bg-gradient-to-r from-accent-blue to-blue-400 bg-clip-text text-transparent">
              Intelligent Voice AI
            </span>
          </h1>
          <p className="mt-8 max-w-3xl mx-auto text-xl text-text-secondary">
            We build custom voice AI agents to answer calls, book appointments, and qualify leads, so you can focus on growing your business.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-6">
            <a href="https://app.appifyai.com/register" className="btn-primary text-lg px-10 py-5 w-full sm:w-auto">Start Free Trial</a>
            <button onClick={() => setShowDemoModal(true)} className="btn-secondary text-lg px-10 py-5 w-full sm:w-auto">Book A Demo</button>
          </div>
          <div className="mt-8 flex justify-center items-center space-x-2 text-text-secondary text-base">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>No Credit or Debit Card Required</span>
          </div>

          {/* Voice Agent Section - Below Hero */}
          <div className="mt-80">
          <h2 className="text-3xl md:text-4xl heading-primary">Speak to Appy Live</h2>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">Click the button below to start a live voice conversation with our AI assistant. Ask it anything about our services!</p>
          <div className="mt-12 flex flex-col items-center gap-6">
            <div className="relative w-48 h-48 rounded-full bg-gradient-to-r from-accent-blue/20 to-blue-400/20 flex items-center justify-center">
              {/* Animated rings */}
              <div className="absolute inset-0 rounded-full border-2 border-accent-blue/30 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-pulse" style={{animationDelay: '1s'}}></div>
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
                    : 'bg-secondary-bg border-2 border-border-gray hover:border-accent-blue hover:scale-105'
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
            <h2 className="text-3xl md:text-4xl heading-primary">...Or Type to our AI Assistant</h2>
            <p className="mt-4 text-lg text-text-secondary">Have questions about our Voice AI solutions, features, or pricing? Appify's AI agent is here to help you 24/7.</p>
          </div>
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="card shadow-2xl flex flex-col h-96">
              <div className="p-6 flex-grow overflow-y-auto space-y-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex items-start gap-3 ${msg.isAI ? 'justify-start' : 'justify-end'}`}>
                    {msg.isAI && (
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-accent-blue to-blue-400 flex items-center justify-center text-sm font-bold text-white">AI</div>
                    )}
                    <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.isAI ? 'bg-secondary-bg text-text-primary' : 'bg-accent-blue text-white'}`}>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    {!msg.isAI && (
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-border-gray flex items-center justify-center text-sm font-bold text-white">U</div>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-start gap-3 justify-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-accent-blue to-blue-400 flex items-center justify-center text-sm font-bold text-white">AI</div>
                    <div className="bg-secondary-bg text-text-primary px-4 py-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <form onSubmit={handleChatSubmit} className="p-4 border-t border-border-gray flex items-center gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatLoading}
                  className="input-field flex-grow" 
                  placeholder={chatLoading ? "AI is thinking..." : "Type your question..."}
                />
                <button 
                  type="submit" 
                  disabled={chatLoading || !chatInput.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
              <h2 className="text-4xl md:text-5xl heading-primary mb-6">
                The Complete <span className="bg-gradient-to-r from-accent-blue to-blue-400 bg-clip-text text-transparent">AI Business Suite</span>
              </h2>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                Everything you need to automate your business operations with intelligent voice AI. 
                See your dashboard, manage calls, and configure your AI assistant - all in one powerful platform.
              </p>
            </div>

            {/* App Screenshots Showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {/* Dashboard Screenshot */}
              <div className="card hover:border-accent-blue transition-all duration-300">
                <div className="bg-primary-bg rounded-lg p-4 mb-4 shadow-2xl overflow-hidden">
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
              <div className="card hover:border-accent-blue transition-all duration-300">
                <div className="bg-primary-bg rounded-lg p-4 mb-4 shadow-2xl overflow-hidden">
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
                <h3 className="text-xl font-bold text-text-primary mb-2">Complete Call Analytics</h3>
                <p className="text-text-secondary text-sm">Track every call with detailed logs, success rates, duration, and cost analysis.</p>
              </div>

              {/* Settings Screenshot */}
              <div className="card hover:border-green-500 transition-all duration-300">
                <div className="bg-primary-bg rounded-lg p-4 mb-4 shadow-2xl overflow-hidden">
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
                <h3 className="text-xl font-bold text-text-primary mb-2">Custom AI Configuration</h3>
                <p className="text-text-secondary text-sm">Personalize your AI agent's voice, personality, and knowledge base for your business.</p>
              </div>

              {/* Interactive Dashboard Screenshot */}
              <div className="card hover:border-yellow-500 transition-all duration-300">
                <div className="bg-primary-bg rounded-lg p-4 mb-4 shadow-2xl overflow-hidden">
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
              <h3 className="text-2xl md:text-3xl heading-primary mb-4">
                Ready to Transform Your Business?
              </h3>
              <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
                Join thousands of businesses already using Appify.AI to automate their operations and grow their revenue.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <a href="https://app.appifyai.com/register" className="btn-primary px-8 py-4">
                  Start Free Trial
                </a>
                <button onClick={() => setShowDemoModal(true)} className="btn-secondary px-8 py-4">
                  Book Demo
                </button>
              </div>
      </div>
          </div>
      </section>



        {/* FAQ Section */}
        <section className="py-20 md:py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-green-400 text-sm font-semibold">FAQs</span>
              <h2 className="text-3xl md:text-4xl heading-primary mt-2">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-4">
              <FAQItem 
                question="How long does it take to get started?"
                answer="Most businesses can get their AI voice agent up and running within 2-3 business days. Our Basic plan includes quick setup, while Pro and Premium plans offer priority setup in 1-2 days."
              />
              <FAQItem 
                question="Is there customer support available?"
                answer="Yes! We provide comprehensive support for all plans. Basic includes email support, Pro includes priority support, and Premium includes dedicated account management and premium support."
              />
              <FAQItem 
                question="How much does your platform cost?"
                answer="Our pricing starts at $249/month for the Basic plan, $499/month for Pro, and $999+/month for Premium/Enterprise. All plans include setup costs and come with included minutes."
              />
              <FAQItem 
                question="Is my data secure on your platform?"
                answer="Absolutely. We use enterprise-grade security with end-to-end encryption, SOC 2 compliance, and regular security audits. Your data is never shared with third parties without your explicit consent."
              />
              <FAQItem 
                question="How does Appify.AI compare to other tools?"
                answer="Appify.AI offers the most comprehensive voice AI solution with real-time analytics, custom AI workflows, and seamless integrations. Unlike basic chatbots, our AI can handle complex conversations, book appointments, and qualify leads just like a human receptionist."
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-24 text-center px-4">
          <h2 className="text-3xl md:text-4xl heading-primary">Choose the Right Plan for You</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">Simple, transparent pricing that scales with your needs.</p>
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto text-left">
            {tiers.map((tier, index) => (
              <div key={tier.name} className={`card p-8 flex flex-col ${index === 1 ? 'border-2 border-accent-blue relative' : ''}`}>
                {index === 1 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-accent-blue text-white px-3 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-text-primary">{tier.name}</h3>
                <p className="mt-4 text-4xl font-extrabold text-text-primary">{tier.price}</p>
                <p className="text-sm text-text-secondary">Setup: {tier.setupCost}</p>
                <p className="text-sm text-text-secondary mb-6">{tier.setupTime}</p>
                <ul className="space-y-3 text-text-secondary flex-grow">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <span className="text-green-400 mr-3 mt-1">✓</span>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 bg-secondary-bg p-4 rounded-md">
                  <p className="font-semibold text-text-primary flex items-center">
                    <svg className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Ideal for:
                  </p>
                  <p className="text-text-secondary text-sm mt-1">{tier.idealFor}</p>
                </div>
                <a 
                  href={`${getAppUrl("/register")}?plan=${tier.name.toLowerCase().replace(' plan', '').replace(' ', '_')}`}
                  className="mt-8 w-full block text-center btn-primary"
                >
                  {tier.name === 'Free Plan' ? 'Start Free' : 'Get Started'}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 md:py-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl heading-primary">Ready to Get Started?</h2>
            <p className="mt-4 text-lg text-text-secondary">Book a demo or drop us a line. We'd love to hear from you.</p>
          </div>
          <div className="mt-12 max-w-xl mx-auto">
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <input 
                type="text" 
                placeholder="Your Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field w-full"
              />
              <input 
                type="email" 
                placeholder="Your Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
              />
              <textarea 
                rows="4" 
                placeholder="Describe your business..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-field w-full"
              ></textarea>
              <div className="flex flex-col sm:flex-row gap-4">
                <button type="submit" className="btn-secondary w-full sm:w-1/2">Send Message</button>
                <button type="button" onClick={() => setShowDemoModal(true)} className="btn-primary w-full sm:w-1/2">Book a Demo</button>
          </div>
            {submitted && (
                <p className="text-green-400 text-sm">Opening your email client… If it didn't open, click "Book a Demo".</p>
            )}
            </form>
          </div>
      </section>

        {/* Enhanced Footer */}
        <footer className="bg-secondary-bg border-t border-border-gray py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Company Info */}
              <div className="lg:col-span-2">
                <div className="flex items-center mb-6">
                  <div className="text-3xl font-bold text-text-primary">Appify.AI</div>
                </div>
                <p className="text-text-secondary text-lg leading-relaxed mb-6 max-w-md">
                  The future of business communication is here. Our intelligent AI receptionist never sleeps, 
                  answering calls, booking appointments, and handling customer inquiries 24/7.
                </p>
                <div className="flex space-x-4">
                  <a href="https://app.appifyai.com/register" className="btn-primary">
                    Start Free Trial
                  </a>
                  <button onClick={() => setShowDemoModal(true)} className="btn-secondary">
                    Book Demo
                  </button>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-6">Quick Links</h3>
                <div className="space-y-4">
                  <a href="#features" className="block text-text-secondary hover:text-text-primary transition hover:translate-x-1">Features</a>
                  <a href="#pricing" className="block text-text-secondary hover:text-text-primary transition hover:translate-x-1">Pricing</a>
                  <a href="#contact" className="block text-text-secondary hover:text-text-primary transition hover:translate-x-1">Contact</a>
                  <a href="https://app.appifyai.com/register" className="block text-text-secondary hover:text-text-primary transition hover:translate-x-1">Get Started</a>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-6">Contact Us</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-accent-blue flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href="mailto:admin@appifyai.com" className="text-text-secondary hover:text-text-primary transition">
                      admin@appifyai.com
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-accent-blue flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href="tel:+15419070061" className="text-gray-300 hover:text-white transition">
                      +1 (541) 907 0061
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <a href="https://wa.me/14155238886" className="text-gray-300 hover:text-white transition">
                      WhatsApp: +1 (415) 523 8886
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Highlight */}
            <div className="bg-gray-800/30 rounded-xl p-8 mb-12">
              <h3 className="text-2xl font-bold text-white text-center mb-8">Why Choose Appify.AI?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Lightning Fast Setup</h4>
                  <p className="text-gray-300 text-sm">Get your AI agent running in minutes, not weeks</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">24/7 Availability</h4>
                  <p className="text-gray-300 text-sm">Never miss a call with round-the-clock AI coverage</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Real-Time Analytics</h4>
                  <p className="text-gray-300 text-sm">Track performance with detailed insights and reports</p>
                </div>
              </div>
            </div>
            
            {/* Bottom Footer */}
            <div className="border-t border-gray-700 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <p className="text-gray-400 text-center md:text-left">
                  &copy; 2025 Appify.AI. All rights reserved. | 
                  <a href="#" className="hover:text-white transition ml-1">Privacy Policy</a> | 
                  <a href="#" className="hover:text-white transition ml-1">Terms of Service</a>
                </p>
                <div className="flex space-x-6">
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
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