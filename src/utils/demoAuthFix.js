/**
 * Demo Authentication Fix
 * Temporary fix to handle authentication for demo
 */

class DemoAuthFix {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'https://appify-ai-server.onrender.com';
  }

  /**
   * Get demo token for authentication
   */
  getDemoToken() {
    // For demo purposes, create a simple token
    const demoUser = {
      id: 'demo_user_' + Date.now(),
      email: 'demo@appifyai.com',
      firstName: 'Demo',
      lastName: 'User',
      plan: 'pro'
    };

    // Store demo user data
    localStorage.setItem('user', JSON.stringify(demoUser));
    localStorage.setItem('demo_token', 'demo_token_' + Date.now());

    return 'demo_token_' + Date.now();
  }

  /**
   * Create agent with demo authentication
   */
  async createAgent(agentData) {
    try {
      console.log('🤖 Creating agent with demo authentication...');
      
      const token = this.getDemoToken();
      
      const response = await fetch(`${this.baseURL}/api/unified-auth/create-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          agentData: agentData
        })
      });

      if (!response.ok) {
        throw new Error(`Agent creation failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Agent created successfully:', result.agent.id);
        return result.agent;
      } else {
        throw new Error(result.error || 'Agent creation failed');
      }
    } catch (error) {
      console.error('❌ Agent creation error:', error);
      
      // Return mock agent for demo
      return this.createMockAgent(agentData);
    }
  }

  /**
   * Create mock agent for demo
   */
  createMockAgent(agentData) {
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    const mockAgent = {
      id: generateUUID(),
      name: agentData.agentName,
      agentName: agentData.agentName,
      agentVoice: agentData.agentVoice || 'alloy',
      firstMessage: agentData.firstMessage || `Hello! I'm ${agentData.agentName}, your AI assistant.`,
      systemPrompt: agentData.systemPrompt || `You are ${agentData.agentName}, a professional AI assistant.`,
      status: 'mock',
      message: 'Mock assistant created for demo',
      createdAt: new Date().toISOString(),
      // Add Vapi-compatible ID
      vapiAssistantId: generateUUID()
    };

    console.log('✅ Mock agent created:', mockAgent.id);
    return mockAgent;
  }

  /**
   * Make authenticated API request
   */
  async apiRequest(endpoint, options = {}) {
    const token = this.getDemoToken();
    
    return fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });
  }
}

export default new DemoAuthFix();