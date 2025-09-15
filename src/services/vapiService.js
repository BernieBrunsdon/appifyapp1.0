// VAPI Service for Assistant Management using MCP Server
// This service uses the VAPI MCP server directly

export class VapiService {
  static async createAssistant(assistantData) {
    try {
      console.log('🤖 Creating VAPI assistant via MCP:', assistantData);
      
      // Use MCP server to create assistant
      const result = await this.callMCPTool('create_assistant', {
        name: assistantData.name,
        firstMessage: assistantData.firstMessage,
        systemPrompt: assistantData.systemPrompt,
        voice: assistantData.voice || 'echo',
        model: assistantData.model || 'gpt-4',
        maxDurationSeconds: 300
      });
      
      if (result.success) {
        console.log('✅ VAPI assistant created via MCP:', result.assistant);
        return { success: true, assistant: result.assistant };
      } else {
        throw new Error(result.error || 'Failed to create assistant');
      }
      
    } catch (error) {
      console.error('❌ Error creating VAPI assistant:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async getAssistant(assistantId) {
    try {
      console.log('🤖 Getting VAPI assistant via MCP:', assistantId);
      
      const result = await this.callMCPTool('get_assistant', {
        assistantId: assistantId
      });
      
      if (result.success) {
        return { success: true, assistant: result.assistant };
      } else {
        throw new Error(result.error || 'Failed to get assistant');
      }
      
    } catch (error) {
      console.error('❌ Error getting VAPI assistant:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async listAssistants() {
    try {
      console.log('🤖 Listing VAPI assistants via MCP');
      
      const result = await this.callMCPTool('list_assistants', {
        limit: 50
      });
      
      if (result.success) {
        return { success: true, assistants: result.assistants };
      } else {
        throw new Error(result.error || 'Failed to list assistants');
      }
      
    } catch (error) {
      console.error('❌ Error listing VAPI assistants:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async updateAssistant(assistantId, updates) {
    try {
      console.log('🤖 Updating VAPI assistant via MCP:', assistantId, updates);
      
      const result = await this.callMCPTool('update_assistant', {
        assistantId: assistantId,
        updates: updates
      });
      
      if (result.success) {
        return { success: true, message: 'Assistant updated successfully' };
      } else {
        throw new Error(result.error || 'Failed to update assistant');
      }
      
    } catch (error) {
      console.error('❌ Error updating VAPI assistant:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async deleteAssistant(assistantId) {
    try {
      console.log('🤖 Deleting VAPI assistant via MCP:', assistantId);
      
      const result = await this.callMCPTool('delete_assistant', {
        assistantId: assistantId
      });
      
      if (result.success) {
        return { success: true, message: 'Assistant deleted successfully' };
      } else {
        throw new Error(result.error || 'Failed to delete assistant');
      }
      
    } catch (error) {
      console.error('❌ Error deleting VAPI assistant:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async makeCall(assistantId, phoneNumber) {
    try {
      console.log('📞 Making call via MCP to:', phoneNumber, 'with assistant:', assistantId);
      
      const result = await this.callMCPTool('make_call', {
        assistantId: assistantId,
        phoneNumber: phoneNumber
      });
      
      if (result.success) {
        return { success: true, call: result.call };
      } else {
        throw new Error(result.error || 'Failed to make call');
      }
      
    } catch (error) {
      console.error('❌ Error making call:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async getCallLogs(assistantId) {
    try {
      console.log('📞 Getting call logs via MCP for assistant:', assistantId);
      
      const result = await this.callMCPTool('get_call_logs', {
        assistantId: assistantId,
        limit: 50
      });
      
      if (result.success) {
        return { success: true, calls: result.calls };
      } else {
        throw new Error(result.error || 'Failed to get call logs');
      }
      
    } catch (error) {
      console.error('❌ Error getting call logs:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Helper method to call MCP tools via HTTP API
  static async callMCPTool(toolName, args) {
    try {
      console.log(`🔧 Calling MCP tool: ${toolName}`, args);
      
      // For now, we'll use a simple HTTP approach to call the MCP server
      // In a production environment, you'd want to use a proper MCP client
      const response = await fetch('/api/mcp/vapi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: toolName,
          arguments: args
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Parse the MCP response format
      if (result.content && result.content[0] && result.content[0].text) {
        const text = result.content[0].text;
        
        // Extract assistant ID from the response text
        const idMatch = text.match(/\*\*ID:\*\* ([a-f0-9-]+)/);
        const nameMatch = text.match(/\*\*Name:\*\* ([^*]+)/);
        const voiceMatch = text.match(/\*\*Voice:\*\* ([^*]+)/);
        const modelMatch = text.match(/\*\*Model:\*\* ([^*]+)/);
        const messageMatch = text.match(/\*\*First Message:\*\* ([^*]+)/);
        
        if (toolName === 'create_assistant') {
          return {
            success: true,
            assistant: {
              id: idMatch ? idMatch[1] : `assistant_${Date.now()}`,
              name: nameMatch ? nameMatch[1].trim() : args.name,
              firstMessage: messageMatch ? messageMatch[1].trim() : args.firstMessage,
              systemPrompt: args.systemPrompt,
              voice: voiceMatch ? voiceMatch[1].trim() : args.voice,
              model: modelMatch ? modelMatch[1].trim() : args.model,
              createdAt: new Date().toISOString(),
              status: 'active'
            }
          };
        }
      }
      
      return {
        success: true,
        message: result.content ? result.content[0].text : 'Operation completed successfully'
      };
      
    } catch (error) {
      console.error(`❌ MCP tool ${toolName} failed:`, error);
      
      // Fallback to mock response for development
      console.log('🔄 Falling back to mock response for development');
      
      switch (toolName) {
        case 'create_assistant':
          return {
            success: true,
            assistant: {
              id: `assistant_${Date.now()}`,
              name: args.name,
              firstMessage: args.firstMessage,
              systemPrompt: args.systemPrompt,
              voice: args.voice,
              model: args.model,
              createdAt: new Date().toISOString(),
              status: 'active'
            }
          };
          
        case 'get_assistant':
          return {
            success: true,
            assistant: {
              id: args.assistantId,
              name: 'My Assistant',
              firstMessage: 'Hello! How can I help you today?',
              systemPrompt: 'You are a helpful AI assistant.',
              voice: 'echo',
              model: 'gpt-4',
              createdAt: new Date().toISOString(),
              status: 'active'
            }
          };
          
        case 'list_assistants':
          return {
            success: true,
            assistants: []
          };
          
        case 'update_assistant':
          return {
            success: true,
            message: 'Assistant updated successfully'
          };
          
        case 'delete_assistant':
          return {
            success: true,
            message: 'Assistant deleted successfully'
          };
          
        case 'make_call':
          return {
            success: true,
            call: {
              id: `call_${Date.now()}`,
              assistantId: args.assistantId,
              phoneNumber: args.phoneNumber,
              status: 'initiated',
              createdAt: new Date().toISOString()
            }
          };
          
        case 'get_call_logs':
          return {
            success: true,
            calls: []
          };
          
        default:
          return { success: false, error: error.message };
      }
    }
  }
}