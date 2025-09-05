// Client Assistant Manager
// Handles client-specific assistant creation and management

const VAPI_REST_API_KEY = '00c60c9f-62b3-4dd3-bede-036242a2b7c5';
const VAPI_BASE_URL = 'https://api.vapi.ai';

export class AssistantManager {
  constructor(clientId) {
    this.clientId = clientId;
  }

  // Create a new assistant for this client
  async createAssistant(settings) {
    try {
      const response = await fetch(`${VAPI_BASE_URL}/assistant`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VAPI_REST_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: settings.assistantName || `Assistant for ${this.clientId}`,
          firstMessage: settings.firstMessage || 'Hello! How can I help you today?',
          model: {
            provider: 'openai',
            model: settings.model || 'gpt-4o',
            temperature: settings.temperature || 0.7,
            messages: [
              {
                role: 'system',
                content: this.buildSystemPrompt(settings.knowledgeBase)
              }
            ]
          },
          voice: {
            provider: 'openai',
            voiceId: settings.voice || 'alloy'
          },
          // Add client metadata for tracking
          metadata: {
            clientId: this.clientId,
            createdAt: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create assistant: ${response.status}`);
      }

      const assistant = await response.json();
      
      // Store assistant ID in Firebase for this client
      await this.saveAssistantId(assistant.id);
      
      return assistant;
    } catch (error) {
      console.error('Error creating assistant:', error);
      throw error;
    }
  }

  // Update existing assistant
  async updateAssistant(assistantId, settings) {
    try {
      const response = await fetch(`${VAPI_BASE_URL}/assistant/${assistantId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${VAPI_REST_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: settings.assistantName,
          firstMessage: settings.firstMessage,
          model: {
            provider: 'openai',
            model: settings.model,
            temperature: settings.temperature,
            messages: [
              {
                role: 'system',
                content: this.buildSystemPrompt(settings.knowledgeBase)
              }
            ]
          },
          voice: {
            provider: 'openai',
            voiceId: settings.voice
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update assistant: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating assistant:', error);
      throw error;
    }
  }

  // Get client's assistant ID from Firebase
  async getAssistantId() {
    try {
      // TODO: Replace with Firebase call
      // const doc = await firestore.collection('clients').doc(this.clientId).get();
      // return doc.data()?.assistantId;
      
      // For now, use localStorage
      return localStorage.getItem(`assistantId_${this.clientId}`);
    } catch (error) {
      console.error('Error getting assistant ID:', error);
      return null;
    }
  }

  // Save assistant ID to Firebase
  async saveAssistantId(assistantId) {
    try {
      // TODO: Replace with Firebase call
      // await firestore.collection('clients').doc(this.clientId).set({
      //   assistantId: assistantId,
      //   updatedAt: new Date().toISOString()
      // }, { merge: true });
      
      // For now, use localStorage
      localStorage.setItem(`assistantId_${this.clientId}`, assistantId);
    } catch (error) {
      console.error('Error saving assistant ID:', error);
      throw error;
    }
  }

  // Build system prompt with knowledge base
  buildSystemPrompt(knowledgeBase) {
    let prompt = "You are a helpful AI assistant for a business. ";
    
    if (knowledgeBase) {
      prompt += `Here's some information about the business:\n\n${knowledgeBase}\n\n`;
    }
    
    prompt += "Use this information to provide accurate and helpful responses to customers. ";
    prompt += "Be friendly, professional, and concise in your responses.";
    
    return prompt;
  }

  // Get or create assistant for this client
  async getOrCreateAssistant(settings) {
    try {
      let assistantId = await this.getAssistantId();
      
      if (assistantId) {
        // Update existing assistant
        return await this.updateAssistant(assistantId, settings);
      } else {
        // Create new assistant
        return await this.createAssistant(settings);
      }
    } catch (error) {
      console.error('Error getting or creating assistant:', error);
      throw error;
    }
  }
}

// Export helper function
export const getAssistantManager = (clientId) => {
  return new AssistantManager(clientId);
};
