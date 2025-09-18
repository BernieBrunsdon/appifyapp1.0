import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import OnboardingModal from './OnboardingModal';
import LoginModal from './LoginModal';
import { registerUser } from '../firebase/auth';
import { FirebaseService } from '../services/firebaseService';

export default function Registration({ onRegister, selectedPlan }) {
  // Map URL plan parameter to form plan
  const getPlanFromUrl = (planParam) => {
    if (!planParam) return 'free';
    const planMap = {
      'free': 'free',
      'basic': 'free',
      'pro': 'pro',
      'premium': 'enterprise',
      'enterprise': 'enterprise'
    };
    return planMap[planParam] || 'free';
  };

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    password: '',
    confirmPassword: '',
    plan: getPlanFromUrl(selectedPlan)
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Form, 2: Payment, 3: Success
  const [showLoginModal, setShowLoginModal] = useState(false); // Login modal state
  const [showOnboardingModal, setShowOnboardingModal] = useState(false); // Onboarding modal state
  const [clientData, setClientData] = useState(null); // Client data for onboarding
  const navigate = useNavigate();

  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: 'Free',
      period: '',
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
      paypalAmount: '0.00',
      paypalItem: 'AppifyAI Free Plan'
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: '$499/mo',
      period: '',
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
      paypalAmount: '499.00',
      paypalItem: 'AppifyAI Pro Plan'
    },
    {
      id: 'enterprise',
      name: 'Premium / Enterprise',
      price: '$1/mo',
      period: ' (Test Mode)',
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
      paypalAmount: '1.00',
      paypalItem: 'AppifyAI Premium Plan (Test Mode)'
    }
  ];

  const currentPlan = plans.find(plan => plan.id === form.plan);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email is invalid';
    if (!form.company.trim()) newErrors.company = 'Company name is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      // Check if email already exists
      const emailExists = await FirebaseService.checkEmailExists(form.email);
      if (emailExists) {
        setErrors({ general: 'An account with this email already exists. Please use a different email or try logging in.' });
        return;
      }
      
      // Register user with Firebase Authentication
      const result = await registerUser(form.email, form.password, {
        firstName: form.firstName,
        lastName: form.lastName,
        company: form.company,
        phone: form.phone,
        plan: form.plan
      });
      
      if (result.success) {
        // Check if email verification is required
        if (result.requiresVerification) {
          // Create client data for Firebase
          const clientData = {
            id: result.user.uid,
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            firstName: form.firstName,
            lastName: form.lastName,
            company: form.company,
            phone: form.phone,
            plan: form.plan,
            status: 'pending_verification'
          };
          
          // Save client to Firebase
          await FirebaseService.createClient(clientData);
          
          // Store user data in localStorage
          localStorage.setItem('user', JSON.stringify(clientData));
          
          // Redirect to email verification
          window.location.href = '/verify-email';
          return;
        }
        
        // Create client data for Firebase
        const clientData = {
          id: result.user.uid,
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          firstName: form.firstName,
          lastName: form.lastName,
          company: form.company,
          phone: form.phone,
          plan: form.plan,
          status: 'active'
        };
        
        // Save client to Firebase
        await FirebaseService.createClient(clientData);
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(clientData));
        
        // For free plan, skip payment and go directly to success
        if (form.plan === 'free') {
          // Skip payment and go directly to success
          handleFreePlanSuccess(clientData);
        } else {
          setCurrentStep(2); // Move to payment step
        }
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific Firebase Auth errors
      let errorMessage = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleFreePlanSuccess = async (clientData) => {
    setPaymentLoading(true);
    
    try {
      // Simulate a brief delay for UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update client data with payment info
      const updatedClientData = {
        ...clientData,
        paymentId: 'free_plan_' + Date.now(),
        paymentStatus: 'completed',
        features: currentPlan.features,
        assistantId: 'pending_assistant_creation',
        whatsappNumber: '+1 (555) 123-4567',
        voiceNumber: '+1 (555) 987-6543'
      };
      
      // Update client in Firebase
      await FirebaseService.updateClient(updatedClientData.id, {
        paymentId: updatedClientData.paymentId,
        paymentStatus: 'completed',
        features: currentPlan.features
      });
      
      // Store client data in state
      setClientData(updatedClientData);
      
      // Update localStorage with complete client data
      localStorage.setItem('user', JSON.stringify(updatedClientData));
      
      setPaymentSuccess(true);
      setCurrentStep(3);
      
      // Show onboarding modal for agent setup
      setShowOnboardingModal(true);
      
    } catch (error) {
      console.error('Free plan setup error:', error);
      setErrors({ general: 'Account setup failed. Please try again.' });
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentSuccess = async (details) => {
    setPaymentLoading(true);
    
    try {
      // Get existing client data from localStorage
      const existingClientData = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!existingClientData.id) {
        throw new Error('Client data not found. Please try again.');
      }
      
      // Update client with payment information
      const updatedClientData = {
        ...existingClientData,
        paymentId: details.id,
        paymentStatus: 'completed',
        features: currentPlan.features,
        assistantId: 'pending_assistant_creation',
        whatsappNumber: '+1 (555) 123-4567',
        voiceNumber: '+1 (555) 987-6543'
      };
      
      // Update client in Firebase
      await FirebaseService.updateClient(existingClientData.id, {
        paymentId: details.id,
        paymentStatus: 'completed',
        features: currentPlan.features
      });
      
      console.log('✅ Payment processed and client updated in Firebase');
      
      // Store updated client data
      localStorage.setItem('user', JSON.stringify(updatedClientData));
      
      // Store client data in state
      setClientData(updatedClientData);
      
      setPaymentSuccess(true);
      setCurrentStep(3);
      
      // Show onboarding modal for agent setup
      setShowOnboardingModal(true);
      
      if (onRegister) {
        onRegister(updatedClientData);
      }
      
    } catch (error) {
      console.error('Payment processing error:', error);
      setErrors({ general: 'Payment processed but account update failed. Please contact support.' });
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setErrors({ general: 'Payment failed. Please try again.' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const renderFormStep = () => (
    <div className="w-full px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6 shadow-2xl shadow-purple-500/25">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
      </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Appify.AI
            </h1>
        <h2 className="text-3xl font-semibold text-white mb-4">Create Your Account</h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Join thousands of businesses automating their operations with intelligent AI assistants
        </p>
        <div className="flex items-center justify-center mt-6 space-x-6 text-sm text-gray-400">
          <div className="flex items-center bg-white/5 px-4 py-2 rounded-full">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            No Setup Fees
          </div>
          <div className="flex items-center bg-white/5 px-4 py-2 rounded-full">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Cancel Anytime
          </div>
          <div className="flex items-center bg-white/5 px-4 py-2 rounded-full">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            24/7 Support
          </div>
        </div>
          </div>

      {/* Main Content - Full Width Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 max-w-none">
        {/* Registration Form - Takes 2/5 of space */}
        <div className="xl:col-span-2">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Account Information</h3>
                <p className="text-gray-400 text-sm">Tell us about yourself</p>
              </div>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    placeholder="John"
                  />
                  {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    placeholder="Doe"
                  />
                  {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  placeholder="john@company.com"
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                <p className="text-gray-400 text-xs mt-1">Use a new email address - existing accounts will show an error</p>
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  placeholder="Acme Corp"
                />
                {errors.company && <p className="text-red-400 text-xs mt-1">{errors.company}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>


              {/* General Error */}
              {errors.general && (
                <div className="text-red-400 text-xs text-center">{errors.general}</div>
              )}

              {/* Continue Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    {form.plan === 'free' ? (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Create Free Account
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        Continue to Payment
                      </>
                    )}
                  </div>
                )}
              </button>

              {/* Login Link */}
              <div className="text-center mt-4">
                <p className="text-gray-400 text-sm">
                  Already have an account?{' '}
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="text-purple-400 hover:text-purple-300 font-semibold underline"
                  >
                    Log in here
                  </button>
                </p>
                
              </div>
            </form>
                </div>
              </div>

        {/* Plan Selection - Takes 3/5 of space */}
        <div className="xl:col-span-3">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Choose Your Plan</h3>
            <p className="text-gray-400">Select the perfect plan for your business needs</p>
          </div>
          
          {/* Marketing Page Style Plan Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <label key={plan.id} className="block cursor-pointer">
                      <input
                        type="radio"
                        name="plan"
                        value={plan.id}
                        checked={form.plan === plan.id}
                        onChange={handleChange}
                        className="sr-only"
                      />
                <div className={`bg-gray-800/40 p-6 rounded-lg border flex flex-col h-full transition-all duration-300 ${
                        form.plan === plan.id
                    ? 'border-2 border-purple-500 shadow-xl shadow-purple-500/20'
                    : 'border-gray-700 hover:border-gray-600'
                }`}>
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-3xl font-extrabold text-white mb-1">{plan.price}</p>
                  <p className="text-sm text-gray-400 mb-4">{plan.period}</p>
                  <ul className="space-y-2 text-gray-300 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start text-sm">
                        <span className="text-green-400 mr-2 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {form.plan === plan.id && (
                    <div className="mt-4 flex items-center justify-center">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        </div>
                    </div>
                  )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Complete Your Payment</h2>
        <p className="text-gray-400">Secure payment powered by PayPal</p>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        {/* Order Summary */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Order Summary</h3>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">{currentPlan.name}</span>
              <span className="text-white font-semibold">{currentPlan.price}{currentPlan.period}</span>
            </div>
            <div className="text-sm text-gray-400">
              Billed monthly • Cancel anytime
            </div>
          </div>
        </div>

        {/* PayPal Integration */}
        <div className="mb-6">
          <PayPalScriptProvider options={{ 
            "client-id": "AUneAqTLHJUsYxOtvOwMGELnsi1520JyLSDtfThe1odiT_oyXLkzE_6S19qn0cAZI8_csM0PhDAOVTq7",
            currency: "USD"
          }}>
            <PayPalButtons
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: currentPlan.paypalAmount,
                      currency_code: "USD"
                    },
                    description: currentPlan.paypalItem
                  }]
                });
              }}
              onApprove={(data, actions) => {
                return actions.order.capture().then((details) => {
                  handlePaymentSuccess(details);
                });
              }}
              onError={handlePaymentError}
              style={{
                layout: 'vertical',
                color: 'blue',
                shape: 'rect',
                label: 'paypal'
              }}
            />
          </PayPalScriptProvider>
        </div>

        {/* Back Button */}
        <button
          onClick={() => setCurrentStep(1)}
          className="w-full py-3 px-4 bg-white/10 border border-white/20 rounded-lg text-white font-semibold hover:bg-white/20 transition"
        >
          Back to Form
        </button>

              {/* General Error */}
              {errors.general && (
          <div className="text-red-400 text-sm text-center mt-4">{errors.general}</div>
        )}
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="w-full max-w-4xl mx-auto text-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
                  </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">Welcome to Appify.AI!</h2>
        <p className="text-gray-300 mb-6">
          Your account has been created successfully. We're setting up your AI assistant and phone number.
        </p>
        
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">What's Next?</h3>
          <ul className="text-left text-gray-300 space-y-2">
            <li>• Your AI assistant is being configured</li>
            <li>• Phone number assignment in progress</li>
            <li>• WhatsApp integration being set up</li>
            <li>• Welcome email sent to {form.email}</li>
          </ul>
              </div>
        
        <button
          onClick={() => setShowOnboardingModal(true)}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition"
        >
          Set Up Your AI Assistant
        </button>
          </div>
        </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-pink-900/20 via-purple-900/20 to-blue-900/20"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-cyan-900/10 via-transparent to-purple-900/10"></div>
      
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        backgroundPosition: 'center center'
      }}></div>

      <div className="relative z-10 w-full min-h-screen py-8 px-4">
        {currentStep === 1 && renderFormStep()}
        {currentStep === 2 && renderPaymentStep()}
        {currentStep === 3 && renderSuccessStep()}
      </div>
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onSuccess={(user, userData) => {
          if (onRegister) {
            onRegister({ user, userData });
          }
          setShowLoginModal(false);
        }}
      />
      
      {/* Onboarding Modal */}
      <OnboardingModal 
        isOpen={showOnboardingModal} 
        onClose={() => setShowOnboardingModal(false)} 
        clientData={clientData}
        onComplete={(agentData) => {
          // Navigate to dashboard after agent setup
          navigate('/dashboard');
        }}
      />
    </div>
  );
}