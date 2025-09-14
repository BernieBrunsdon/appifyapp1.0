/**
 * Unified Authentication Service for Frontend
 * Handles both Firebase and JWT authentication seamlessly
 */

class UnifiedAuthService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'https://appify-ai-server.onrender.com';
    this.currentUser = null;
    this.accessToken = null;
    this.refreshToken = null;
  }

  /**
   * Initialize authentication with Firebase token
   */
  async initializeWithFirebase(firebaseToken, userData) {
    try {
      console.log('🔐 Initializing unified auth with Firebase token...');
      
      const response = await fetch(`${this.baseURL}/api/unified-auth/unified`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: firebaseToken,
          userData: userData
        })
      });

      if (!response.ok) {
        throw new Error(`Auth failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.currentUser = data.user;
        this.accessToken = data.tokens.accessToken;
        this.refreshToken = data.tokens.refreshToken;
        
        // Store tokens securely
        localStorage.setItem('accessToken', this.accessToken);
        localStorage.setItem('refreshToken', this.refreshToken);
        localStorage.setItem('user', JSON.stringify(this.currentUser));
        
        console.log('✅ Unified auth successful:', this.currentUser.email);
        return { success: true, user: this.currentUser };
      } else {
        throw new Error(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('❌ Unified auth error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create agent for current user
   */
  async createAgent(agentData) {
    try {
      console.log('🤖 Creating agent via unified auth...');
      
      const response = await fetch(`${this.baseURL}/api/unified-auth/create-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({
          agentData: agentData
        })
      });

      if (!response.ok) {
        throw new Error(`Agent creation failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Agent created successfully:', data.agent.id);
        
        // Store agent data
        localStorage.setItem('agentData', JSON.stringify(data.agent));
        
        return { success: true, agent: data.agent };
      } else {
        throw new Error(data.error || 'Agent creation failed');
      }
    } catch (error) {
      console.error('❌ Agent creation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's agent
   */
  async getAgent() {
    try {
      console.log('🔍 Getting user agent...');
      
      const response = await fetch(`${this.baseURL}/api/unified-auth/my-agent`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Get agent failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        if (data.agent) {
          localStorage.setItem('agentData', JSON.stringify(data.agent));
        }
        return { success: true, agent: data.agent };
      } else {
        throw new Error(data.error || 'Get agent failed');
      }
    } catch (error) {
      console.error('❌ Get agent error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Make authenticated API request
   */
  async apiRequest(endpoint, options = {}) {
    try {
      // Ensure we have a valid token
      if (!this.accessToken) {
        await this.refreshAccessToken();
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
          ...options.headers
        }
      });

      // Handle token refresh if needed
      if (response.status === 401) {
        console.log('🔄 Token expired, refreshing...');
        await this.refreshAccessToken();
        
        // Retry request with new token
        return fetch(`${this.baseURL}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
            ...options.headers
          }
        });
      }

      return response;
    } catch (error) {
      console.error('❌ API request error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken() {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.baseURL}/api/unified-auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken
        })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      if (data.success) {
        this.accessToken = data.accessToken;
        localStorage.setItem('accessToken', this.accessToken);
        console.log('✅ Access token refreshed');
        return true;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      this.logout();
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout() {
    this.currentUser = null;
    this.accessToken = null;
    this.refreshToken = null;
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('agentData');
    
    console.log('👋 User logged out');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.accessToken && !!this.currentUser;
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Initialize from stored tokens
   */
  async initializeFromStorage() {
    try {
      const storedToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        this.accessToken = storedToken;
        this.currentUser = JSON.parse(storedUser);
        this.refreshToken = localStorage.getItem('refreshToken');
        
        // Verify token is still valid
        try {
          const response = await fetch(`${this.baseURL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          });
          
          if (response.ok) {
            console.log('✅ User authenticated from storage');
            return true;
          } else {
            throw new Error('Token invalid');
          }
        } catch (error) {
          console.log('⚠️ Stored token invalid, clearing storage');
          this.logout();
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ Storage initialization error:', error);
      this.logout();
      return false;
    }
  }
}

// Export singleton instance
export default new UnifiedAuthService();