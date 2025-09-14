/**
 * Assistant Manager - Clean, consolidated implementation
 * Handles client-specific assistant creation and management
 */

export class AssistantManager {
  constructor(clientId) {
    this.clientId = clientId;
  }

  /**
   * Create a new assistant for this client
   * @param {Object} settings - Assistant settings
   * @returns {Promise<Object>} Created assistant
   */
  async createAssistant(settings) {
    try {
      const response = await fetch('/api/assistants/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: this.clientId,
          settings: {
            assistantName: settings.assistantName || `Assistant for ${this.clientId}`,
            firstMessage: settings.firstMessage || 'Hello! How can I help you today?',
            model: settings.model || 'gpt-4o',
            temperature: settings.temperature || 0.7,
            voice: settings.voice || 'alloy',
            knowledgeBase: settings.knowledgeBase,
            websiteAddress: settings.websiteAddress,
            businessAddress: settings.businessAddress,
            region: settings.region
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create assistant: ${response.status}`);
      }

      const assistant = await response.json();
      
      // Store assistant ID for this client
      await this.saveAssistantId(assistant.id);
      
      return assistant;
    } catch (error) {
      console.error('Error creating assistant:', error);
      throw error;
    }
  }

  /**
   * Update existing assistant
   * @param {string} assistantId - Assistant ID
   * @param {Object} settings - Updated settings
   * @returns {Promise<Object>} Updated assistant
   */
  async updateAssistant(assistantId, settings) {
    try {
      const response = await fetch(`/api/assistants/${assistantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: this.clientId,
          settings: {
            assistantName: settings.assistantName,
            firstMessage: settings.firstMessage,
            model: settings.model,
            temperature: settings.temperature,
            voice: settings.voice,
            knowledgeBase: settings.knowledgeBase,
            websiteAddress: settings.websiteAddress,
            businessAddress: settings.businessAddress,
            region: settings.region
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

  /**
   * Get client's assistant ID from localStorage
   * @returns {Promise<string|null>} Assistant ID or null
   */
  async getAssistantId() {
    try {
      return localStorage.getItem(`assistantId_${this.clientId}`);
    } catch (error) {
      console.error('Error getting assistant ID:', error);
      return null;
    }
  }

  /**
   * Save assistant ID to localStorage
   * @param {string} assistantId - Assistant ID to save
   * @returns {Promise<void>}
   */
  async saveAssistantId(assistantId) {
    try {
      localStorage.setItem(`assistantId_${this.clientId}`, assistantId);
    } catch (error) {
      console.error('Error saving assistant ID:', error);
      throw error;
    }
  }

  /**
   * Build system prompt with knowledge base
   * @param {string} knowledgeBase - Knowledge base content
   * @returns {string} System prompt
   */
  buildSystemPrompt(knowledgeBase) {
    let prompt = "You are a helpful AI assistant for a business. ";
    
    if (knowledgeBase) {
      prompt += `Here's some information about the business:\n\n${knowledgeBase}\n\n`;
    }
    
    prompt += "Use this information to provide accurate and helpful responses to customers. ";
    prompt += "Be friendly, professional, and concise in your responses.";
    
    return prompt;
  }

  /**
   * Get or create assistant for this client
   * @param {Object} settings - Assistant settings
   * @returns {Promise<Object>} Assistant data
   */
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

  /**
   * List assistants
   * @param {number} limit - Maximum number of assistants to return
   * @returns {Promise<Object>} List of assistants
   */
  async listAssistants(limit = 50) {
    try {
      const response = await fetch(`/api/assistants?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to list assistants: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing assistants:', error);
      throw error;
    }
  }

  /**
   * Get specific assistant
   * @param {string} assistantId - Assistant ID
   * @returns {Promise<Object>} Assistant data
   */
  async getAssistant(assistantId) {
    try {
      const response = await fetch(`/api/assistants/${assistantId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get assistant: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting assistant:', error);
      throw error;
    }
  }

  /**
   * Delete assistant
   * @param {string} assistantId - Assistant ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteAssistant(assistantId) {
    try {
      const response = await fetch(`/api/assistants/${assistantId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete assistant: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting assistant:', error);
      throw error;
    }
  }

  /**
   * Make a call
   * @param {string} assistantId - Assistant ID
   * @param {string} phoneNumber - Phone number to call
   * @returns {Promise<Object>} Call result
   */
  async makeCall(assistantId, phoneNumber) {
    try {
      const response = await fetch('/api/calls/make', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistantId: assistantId,
          phoneNumber: phoneNumber
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to make call: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error making call:', error);
      throw error;
    }
  }

  /**
   * Get call logs
   * @param {string} assistantId - Assistant ID
   * @param {number} limit - Maximum number of logs to return
   * @returns {Promise<Object>} Call logs
   */
  async getCallLogs(assistantId, limit = 50) {
    try {
      const response = await fetch(`/api/calls/logs?assistantId=${assistantId}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get call logs: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting call logs:', error);
      throw error;
    }
  }
}

/**
 * Get assistant manager instance for a client
 * @param {string} clientId - Client ID
 * @returns {AssistantManager} Assistant manager instance
 */
export const getAssistantManager = (clientId) => {
  return new AssistantManager(clientId);
};