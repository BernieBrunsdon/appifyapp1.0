// Feature definitions for each plan
export const PLAN_FEATURES = {
  free: {
    name: 'Free Plan',
    features: [
      'basic_voice_calls',
      'basic_whatsapp',
      'basic_chatbot',
      'basic_customization'
    ],
    limits: {
      voiceCallsPerMonth: 100,
      whatsappMessagesPerMonth: 500,
      chatbotInteractionsPerMonth: 1000,
      maxAgents: 1
    }
  },
  pro: {
    name: 'Pro Plan',
    features: [
      'basic_voice_calls',
      'basic_whatsapp',
      'basic_chatbot',
      'basic_customization',
      'advanced_voice_calls',
      'advanced_whatsapp',
      'call_analytics',
      'custom_voice_settings',
      'business_hours'
    ],
    limits: {
      voiceCallsPerMonth: 1000,
      whatsappMessagesPerMonth: 5000,
      chatbotInteractionsPerMonth: 10000,
      maxAgents: 3
    }
  },
  enterprise: {
    name: 'Enterprise Plan',
    features: [
      'basic_voice_calls',
      'basic_whatsapp',
      'basic_chatbot',
      'basic_customization',
      'advanced_voice_calls',
      'advanced_whatsapp',
      'call_analytics',
      'custom_voice_settings',
      'business_hours',
      'email_integration',
      'calendar_integration',
      'crm_integration',
      'custom_automations',
      'priority_support',
      'custom_setup'
    ],
    limits: {
      voiceCallsPerMonth: -1, // Unlimited
      whatsappMessagesPerMonth: -1, // Unlimited
      chatbotInteractionsPerMonth: -1, // Unlimited
      maxAgents: -1 // Unlimited
    }
  }
};

// Check if user has access to a specific feature
export const hasFeature = (userPlan, feature) => {
  const plan = PLAN_FEATURES[userPlan];
  if (!plan) return false;
  
  return plan.features.includes(feature);
};

// Check if user is within limits
export const isWithinLimits = (userPlan, feature, currentUsage) => {
  const plan = PLAN_FEATURES[userPlan];
  if (!plan) return false;
  
  const limit = plan.limits[feature];
  if (limit === -1) return true; // Unlimited
  
  return currentUsage < limit;
};

// Get upgrade prompt message
export const getUpgradePrompt = (userPlan, feature) => {
  const plan = PLAN_FEATURES[userPlan];
  if (!plan) return 'Please upgrade your plan to access this feature.';
  
  const upgradeMessages = {
    email_integration: 'Upgrade to Enterprise plan to connect your email and calendar.',
    calendar_integration: 'Upgrade to Enterprise plan to enable calendar booking.',
    crm_integration: 'Upgrade to Enterprise plan to integrate with your CRM.',
    custom_automations: 'Upgrade to Enterprise plan for custom automations.',
    priority_support: 'Upgrade to Enterprise plan for priority support.',
    custom_setup: 'Upgrade to Enterprise plan for custom setup and configuration.'
  };
  
  return upgradeMessages[feature] || 'Please upgrade your plan to access this feature.';
};

// Get plan comparison data
export const getPlanComparison = () => {
  return Object.entries(PLAN_FEATURES).map(([key, plan]) => ({
    key,
    name: plan.name,
    features: plan.features,
    limits: plan.limits
  }));
};

// Check if user can create more agents
export const canCreateAgent = (userPlan, currentAgentCount) => {
  const plan = PLAN_FEATURES[userPlan];
  if (!plan) return false;
  
  const maxAgents = plan.limits.maxAgents;
  if (maxAgents === -1) return true; // Unlimited
  
  return currentAgentCount < maxAgents;
};

// Get usage warnings
export const getUsageWarnings = (userPlan, usage) => {
  const plan = PLAN_FEATURES[userPlan];
  if (!plan) return [];
  
  const warnings = [];
  
  Object.entries(usage).forEach(([feature, currentUsage]) => {
    const limit = plan.limits[feature];
    if (limit === -1) return; // Unlimited
    
    const percentage = (currentUsage / limit) * 100;
    
    if (percentage >= 90) {
      warnings.push({
        feature,
        message: `You've used ${percentage.toFixed(0)}% of your ${feature} limit.`,
        urgent: true
      });
    } else if (percentage >= 75) {
      warnings.push({
        feature,
        message: `You've used ${percentage.toFixed(0)}% of your ${feature} limit.`,
        urgent: false
      });
    }
  });
  
  return warnings;
};
