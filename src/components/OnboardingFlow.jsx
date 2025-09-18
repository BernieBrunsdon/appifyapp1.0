import React, { useState } from 'react';
import { FirebaseService } from '../services/firebaseService';

const API_URL = 'https://api.vapi.ai/assistant';
const REST_API_KEY = '00c60c9f-62b3-4dd3-bede-036242a2b7c5';

const OnboardingFlow = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    agentName: '',
    openingLine: '',
    voice: 'alloy',
    knowledgeBase: '',
    businessDescription: '',
    dosAndDonts: '',
    customPrompt: ''
  });

  const totalSteps = 4;

  // Voice options
  const voiceOptions = [
    { value: 'alloy', label: 'Alloy (Neutral)', description: 'Balanced and professional' },
    { value: 'echo', label: 'Echo (Male)', description: 'Confident and authoritative' },
    { value: 'fable', label: 'Fable (British)', description: 'Sophisticated and charming' },
    { value: 'onyx', label: 'Onyx (Deep)', description: 'Warm and trustworthy' },
    { value: 'nova', label: 'Nova (Female)', description: 'Friendly and approachable' },
    { value: 'shimmer', label: 'Shimmer (Soft)', description: 'Gentle and calming' }
  ];

  // Pre-defined opening lines
  const openingLineOptions = [
    `Hello! I'm ${formData.agentName || 'your AI assistant'}, how can I help you today?`,
    `Hi there! I'm ${formData.agentName || 'your AI assistant'}, what can I do for you?`,
    `Good day! I'm ${formData.agentName || 'your AI assistant'}, how may I assist you?`,
    `Welcome! I'm ${formData.agentName || 'your AI assistant'}, what brings you here today?`,
    `Hello! I'm ${formData.agentName || 'your AI assistant'}, ready to help with whatever you need!`
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      console.log('🚀 Creating assistant with data:', formData);

      // Create Vapi assistant
      const assistantConfig = {
        name: formData.agentName,
        model: {
          provider: 'openai',
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 1000,
          messages: [
            {
              role: 'system',
              content: `You are ${formData.agentName}, an AI assistant.

Business Description: ${formData.businessDescription}

Knowledge Base: ${formData.knowledgeBase}

Guidelines:
- ${formData.dosAndDonts}

${formData.customPrompt ? `Additional Instructions: ${formData.customPrompt}` : ''}

Always be helpful, professional, and stay in character as ${formData.agentName}.`
            }
          ]
        },
        voice: {
          provider: 'openai',
          voiceId: formData.voice
        },
        firstMessage: formData.openingLine,
        maxDurationSeconds: 300
      };

      console.log('🔧 Sending Vapi request:', assistantConfig);

      const vapiResponse = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${REST_API_KEY}`
        },
        body: JSON.stringify(assistantConfig)
      });

      if (!vapiResponse.ok) {
        const errorData = await vapiResponse.json().catch(() => ({}));
        console.error('❌ Vapi API Error:', errorData);
        throw new Error(`Failed to create Vapi assistant: ${errorData.message || vapiResponse.statusText}`);
      }

      const vapiAssistant = await vapiResponse.json();
      console.log('✅ Vapi assistant created:', vapiAssistant);

      // Create agent data for Firebase
      const agentData = {
        agentName: formData.agentName,
        firstMessage: formData.openingLine,
        agentVoice: formData.voice,
        systemPrompt: `You are ${formData.agentName}, an AI assistant. 

Business Description: ${formData.businessDescription}

Knowledge Base: ${formData.knowledgeBase}

Guidelines:
- ${formData.dosAndDonts}

${formData.customPrompt ? `Additional Instructions: ${formData.customPrompt}` : ''}

Always be helpful, professional, and stay in character as ${formData.agentName}.`,
        vapiAssistantId: vapiAssistant.id,
        assignedPhoneNumber: '+1 (555) 123-4567',
        whatsappNumber: '+1 (555) 987-6543',
        createdAt: new Date().toISOString()
      };

      // Save to Firebase
      const savedAgent = await FirebaseService.createAgent(agentData);
      console.log('✅ Agent saved to Firebase:', savedAgent);

      // Save to localStorage
      localStorage.setItem('agentData', JSON.stringify(savedAgent));

      // Update user data
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUserData = {
        ...userData,
        agent: savedAgent
      };
      localStorage.setItem('user', JSON.stringify(updatedUserData));

      // Complete onboarding
      onComplete(savedAgent);

    } catch (error) {
      console.error('❌ Error creating assistant:', error);
      alert('Failed to create assistant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center">
            <div className="text-6xl mb-6">🤖</div>
            <h2 className="text-3xl font-bold text-white mb-4">Let's create your AI assistant!</h2>
            <p className="text-gray-300 mb-8">First, let's give your assistant a name</p>
            
            <div className="max-w-md mx-auto">
              <input
                type="text"
                value={formData.agentName}
                onChange={(e) => updateFormData('agentName', e.target.value)}
                placeholder="Enter assistant name (e.g., Sarah, Alex, Max)"
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-lg"
              />
              <p className="text-gray-400 text-sm mt-2">This will be how your assistant introduces itself</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="text-center">
            <div className="text-6xl mb-6">💬</div>
            <h2 className="text-3xl font-bold text-white mb-4">Choose an opening line</h2>
            <p className="text-gray-300 mb-8">How should {formData.agentName || 'your assistant'} greet customers?</p>
            
            <div className="max-w-2xl mx-auto space-y-4">
              {openingLineOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => updateFormData('openingLine', option)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    formData.openingLine === option
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="font-medium">{option}</div>
                </button>
              ))}
              
              <div className="mt-6">
                <input
                  type="text"
                  value={formData.openingLine}
                  onChange={(e) => updateFormData('openingLine', e.target.value)}
                  placeholder="Or write your own custom opening line..."
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center">
            <div className="text-6xl mb-6">🎤</div>
            <h2 className="text-3xl font-bold text-white mb-4">Select a voice</h2>
            <p className="text-gray-300 mb-8">Choose the voice that best represents {formData.agentName || 'your assistant'}</p>
            
            <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              {voiceOptions.map((voice) => (
                <button
                  key={voice.value}
                  onClick={() => updateFormData('voice', voice.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    formData.voice === voice.value
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="font-medium text-lg">{voice.label}</div>
                  <div className="text-sm opacity-75">{voice.description}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center">
            <div className="text-6xl mb-6">🧠</div>
            <h2 className="text-3xl font-bold text-white mb-4">Build your assistant's knowledge</h2>
            <p className="text-gray-300 mb-8">Help {formData.agentName || 'your assistant'} understand your business</p>
            
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <label className="block text-white font-medium mb-3 text-left">What does your business do?</label>
                <textarea
                  value={formData.businessDescription}
                  onChange={(e) => updateFormData('businessDescription', e.target.value)}
                  placeholder="Describe your business, services, products, and what makes you unique..."
                  rows={4}
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-3 text-left">Knowledge Base & Expertise</label>
                <textarea
                  value={formData.knowledgeBase}
                  onChange={(e) => updateFormData('knowledgeBase', e.target.value)}
                  placeholder="What specific knowledge should your assistant have? (products, pricing, policies, procedures, etc.)"
                  rows={4}
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-3 text-left">Do's and Don'ts</label>
                <textarea
                  value={formData.dosAndDonts}
                  onChange={(e) => updateFormData('dosAndDonts', e.target.value)}
                  placeholder="How should your assistant behave? What should it always do? What should it never do? (e.g., Always be polite, Never make promises about pricing, Always ask for contact info for complex issues)"
                  rows={4}
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-3 text-left">Additional Instructions (Optional)</label>
                <textarea
                  value={formData.customPrompt}
                  onChange={(e) => updateFormData('customPrompt', e.target.value)}
                  placeholder="Any specific instructions, personality traits, or special behaviors for your assistant?"
                  rows={3}
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.agentName.trim().length > 0;
      case 2:
        return formData.openingLine.trim().length > 0;
      case 3:
        return formData.voice.length > 0;
      case 4:
        return formData.businessDescription.trim().length > 0 && 
               formData.knowledgeBase.trim().length > 0 && 
               formData.dosAndDonts.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-gray-300">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!canProceed() || loading}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Creating Assistant...
                </div>
              ) : (
                'Create Assistant'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;