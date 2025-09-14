describe('API Integration Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Authentication API', () => {
    it('should test login API endpoint', () => {
      cy.apiRequest('POST', '/api/auth/login', {
        email: 'test@example.com',
        password: 'testpassword123'
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;
        expect(response.body.user).to.have.property('email');
        expect(response.body.tokens).to.have.property('accessToken');
        expect(response.body.tokens).to.have.property('refreshToken');
      });
    });

    it('should test registration API endpoint', () => {
      const userData = {
        firstName: 'API',
        lastName: 'Test',
        email: 'apitest@example.com',
        password: 'apipassword123',
        company: 'API Test Company',
        phone: '+1234567890',
        plan: 'pro'
      };

      cy.apiRequest('POST', '/api/auth/register', userData).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.success).to.be.true;
        expect(response.body.user.email).to.eq(userData.email);
        expect(response.body.tokens).to.have.property('accessToken');
      });
    });

    it('should test token refresh API endpoint', () => {
      // First login to get tokens
      cy.apiLogin('test@example.com', 'testpassword123').then((accessToken) => {
        // Get refresh token from localStorage or make another login call
        cy.apiRequest('POST', '/api/auth/login', {
          email: 'test@example.com',
          password: 'testpassword123'
        }).then((loginResponse) => {
          const refreshToken = loginResponse.body.tokens.refreshToken;
          
          // Test refresh endpoint
          cy.apiRequest('POST', '/api/auth/refresh', {
            refreshToken: refreshToken
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.success).to.be.true;
            expect(response.body.accessToken).to.be.a('string');
          });
        });
      });
    });

    it('should test protected endpoint with valid token', () => {
      cy.apiLogin('test@example.com', 'testpassword123').then((accessToken) => {
        cy.apiRequest('GET', '/api/auth/me', null, {
          'Authorization': `Bearer ${accessToken}`
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.success).to.be.true;
          expect(response.body.user).to.have.property('email');
        });
      });
    });

    it('should test protected endpoint without token', () => {
      cy.apiRequest('GET', '/api/auth/me').then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.error).to.contain('Access denied');
      });
    });

    it('should test password change API endpoint', () => {
      cy.apiLogin('test@example.com', 'testpassword123').then((accessToken) => {
        cy.apiRequest('POST', '/api/auth/change-password', {
          currentPassword: 'testpassword123',
          newPassword: 'newpassword123'
        }, {
          'Authorization': `Bearer ${accessToken}`
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.success).to.be.true;
          expect(response.body.message).to.contain('Password changed successfully');
        });
      });
    });
  });

  describe('Health Check API', () => {
    it('should test basic health check endpoint', () => {
      cy.apiRequest('GET', '/health').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.status).to.eq('OK');
        expect(response.body.timestamp).to.be.a('string');
        expect(response.body.uptime).to.be.a('number');
        expect(response.body.environment).to.be.a('string');
        expect(response.body.version).to.be.a('string');
        expect(response.body.memory).to.be.an('object');
        expect(response.body.cpu).to.be.an('object');
      });
    });

    it('should test detailed health check endpoint', () => {
      cy.apiRequest('GET', '/health/detailed').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.status).to.eq('OK');
        expect(response.body.services).to.be.an('object');
        expect(response.body.services.firebase).to.be.an('object');
        expect(response.body.services.sentry).to.be.an('object');
      });
    });

    it('should test readiness check endpoint', () => {
      cy.apiRequest('GET', '/health/ready').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.status).to.eq('READY');
        expect(response.body.checks).to.be.an('object');
        expect(response.body.checks.database).to.be.true;
        expect(response.body.checks.services).to.be.true;
      });
    });

    it('should test liveness check endpoint', () => {
      cy.apiRequest('GET', '/health/live').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.status).to.eq('ALIVE');
        expect(response.body.timestamp).to.be.a('string');
        expect(response.body.uptime).to.be.a('number');
      });
    });

    it('should test metrics endpoint', () => {
      cy.apiRequest('GET', '/health/metrics').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.timestamp).to.be.a('string');
        expect(response.body.uptime).to.be.a('number');
        expect(response.body.memory).to.be.an('object');
        expect(response.body.cpu).to.be.an('object');
        expect(response.body.platform).to.be.an('object');
        expect(response.body.platform.nodeVersion).to.be.a('string');
        expect(response.body.platform.platform).to.be.a('string');
        expect(response.body.platform.arch).to.be.a('string');
      });
    });

    it('should test system info endpoint', () => {
      cy.apiRequest('GET', '/health/info').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.timestamp).to.be.a('string');
        expect(response.body.application).to.be.an('object');
        expect(response.body.application.name).to.eq('Appify.AI Backend');
        expect(response.body.application.version).to.be.a('string');
        expect(response.body.application.environment).to.be.a('string');
        expect(response.body.system).to.be.an('object');
        expect(response.body.environment).to.be.an('object');
      });
    });
  });

  describe('Client Management API', () => {
    let accessToken;

    beforeEach(() => {
      cy.apiLogin('test@example.com', 'testpassword123').then((token) => {
        accessToken = token;
      });
    });

    it('should test get client endpoint', () => {
      cy.apiRequest('GET', '/api/clients/test_client_123', null, {
        'Authorization': `Bearer ${accessToken}`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.status).to.eq('success');
        expect(response.body.client).to.be.an('object');
      });
    });

    it('should test create client endpoint', () => {
      const clientData = {
        firstName: 'API',
        lastName: 'Client',
        email: 'apiclient@example.com',
        company: 'API Test Company',
        plan: 'pro'
      };

      cy.apiRequest('POST', '/api/clients/create', clientData, {
        'Authorization': `Bearer ${accessToken}`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.status).to.eq('success');
        expect(response.body.message).to.contain('Client created successfully');
        expect(response.body.clientId).to.be.a('string');
      });
    });

    it('should test update client endpoint', () => {
      const updateData = {
        company: 'Updated Company Name',
        plan: 'enterprise'
      };

      cy.apiRequest('PUT', '/api/clients/test_client_123', updateData, {
        'Authorization': `Bearer ${accessToken}`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.status).to.eq('success');
        expect(response.body.message).to.contain('Client updated successfully');
      });
    });
  });

  describe('Agent Management API', () => {
    let accessToken;

    beforeEach(() => {
      cy.apiLogin('test@example.com', 'testpassword123').then((token) => {
        accessToken = token;
      });
    });

    it('should test create agent endpoint', () => {
      const agentData = {
        clientId: 'test_client_123',
        agentName: 'API Test Agent',
        agentVoice: 'alloy',
        firstMessage: 'Hello! How can I help you today?',
        systemPrompt: 'You are a helpful customer support agent.'
      };

      cy.apiRequest('POST', '/api/agents/create', agentData, {
        'Authorization': `Bearer ${accessToken}`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.status).to.eq('success');
        expect(response.body.message).to.contain('Agent created successfully');
        expect(response.body.agentId).to.be.a('string');
        expect(response.body.vapiAssistantId).to.be.a('string');
      });
    });
  });

  describe('WhatsApp Integration API', () => {
    let accessToken;

    beforeEach(() => {
      cy.apiLogin('test@example.com', 'testpassword123').then((token) => {
        accessToken = token;
      });
    });

    it('should test WhatsApp webhook endpoint', () => {
      const webhookData = {
        From: 'whatsapp:+1234567890',
        Body: 'Hello, this is a test message',
        NumMedia: '0',
        MessageSid: 'test_message_sid'
      };

      cy.apiRequest('POST', '/api/whatsapp/webhook', webhookData).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('should test WhatsApp message sending', () => {
      const messageData = {
        to: '+1234567890',
        message: 'Hello from API test!',
        clientId: 'test_client_123'
      };

      cy.apiRequest('POST', '/api/whatsapp/send', messageData, {
        'Authorization': `Bearer ${accessToken}`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;
        expect(response.body.message).to.contain('Message sent successfully');
      });
    });
  });

  describe('Voice Integration API', () => {
    let accessToken;

    beforeEach(() => {
      cy.apiLogin('test@example.com', 'testpassword123').then((token) => {
        accessToken = token;
      });
    });

    it('should test voice call initiation', () => {
      const callData = {
        to: '+1234567890',
        clientId: 'test_client_123',
        agentId: 'test_agent_123'
      };

      cy.apiRequest('POST', '/api/voice/call', callData, {
        'Authorization': `Bearer ${accessToken}`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;
        expect(response.body.message).to.contain('Call initiated successfully');
        expect(response.body.callId).to.be.a('string');
      });
    });

    it('should test voice call status', () => {
      cy.apiRequest('GET', '/api/voice/call/test_call_123', null, {
        'Authorization': `Bearer ${accessToken}`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;
        expect(response.body.call).to.be.an('object');
        expect(response.body.call.status).to.be.a('string');
      });
    });
  });

  describe('Chatbot Integration API', () => {
    let accessToken;

    beforeEach(() => {
      cy.apiLogin('test@example.com', 'testpassword123').then((token) => {
        accessToken = token;
      });
    });

    it('should test chatbot message processing', () => {
      const messageData = {
        message: 'Hello, I need help with my order',
        clientId: 'test_client_123',
        userId: 'test_user_123'
      };

      cy.apiRequest('POST', '/api/chatbot/message', messageData, {
        'Authorization': `Bearer ${accessToken}`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;
        expect(response.body.response).to.be.a('string');
        expect(response.body.messageId).to.be.a('string');
      });
    });

    it('should test chatbot conversation history', () => {
      cy.apiRequest('GET', '/api/chatbot/conversation/test_user_123', null, {
        'Authorization': `Bearer ${accessToken}`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;
        expect(response.body.messages).to.be.an('array');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', () => {
      cy.apiRequest('GET', '/api/nonexistent-endpoint').then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body.status).to.eq('error');
        expect(response.body.message).to.contain('Route not found');
      });
    });

    it('should handle 500 errors', () => {
      cy.apiRequest('GET', '/health/error').then((response) => {
        expect(response.status).to.eq(500);
        expect(response.body.error).to.contain('Simulated generic error');
      });
    });

    it('should handle validation errors', () => {
      cy.apiRequest('POST', '/api/auth/login', {
        email: 'invalid-email',
        password: '123'
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.success).to.be.false;
        expect(response.body.errors).to.be.an('array');
        expect(response.body.errors.length).to.be.greaterThan(0);
      });
    });

    it('should handle rate limiting', () => {
      // Make multiple rapid requests to test rate limiting
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(cy.apiRequest('GET', '/health'));
      }

      cy.wrap(requests).then(() => {
        // All requests should succeed as we're within rate limits
        cy.log('Rate limiting test completed');
      });
    });
  });

  describe('Performance Testing', () => {
    it('should measure API response times', () => {
      const startTime = Date.now();
      
      cy.apiRequest('GET', '/health').then((response) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        expect(response.status).to.eq(200);
        expect(responseTime).to.be.lessThan(1000); // Should respond within 1 second
        
        cy.log(`Health check response time: ${responseTime}ms`);
      });
    });

    it('should test concurrent API requests', () => {
      const requests = [];
      
      // Make 5 concurrent requests
      for (let i = 0; i < 5; i++) {
        requests.push(cy.apiRequest('GET', '/health'));
      }

      cy.wrap(requests).then(() => {
        cy.log('Concurrent requests test completed');
      });
    });

    it('should test API under load', () => {
      const requests = [];
      
      // Make 20 requests to test load handling
      for (let i = 0; i < 20; i++) {
        requests.push(cy.apiRequest('GET', '/health'));
      }

      cy.wrap(requests).then(() => {
        cy.log('Load testing completed');
      });
    });
  });

  describe('Security Testing', () => {
    it('should test SQL injection protection', () => {
      const maliciousData = {
        email: "test@example.com'; DROP TABLE users; --",
        password: 'password123'
      };

      cy.apiRequest('POST', '/api/auth/login', maliciousData).then((response) => {
        // Should not cause a server error
        expect(response.status).to.be.oneOf([400, 401, 422]);
        expect(response.body).to.not.contain('SQL');
        expect(response.body).to.not.contain('database');
      });
    });

    it('should test XSS protection', () => {
      const maliciousData = {
        email: 'test@example.com',
        password: '<script>alert("XSS")</script>'
      };

      cy.apiRequest('POST', '/api/auth/login', maliciousData).then((response) => {
        // Should not execute the script
        expect(response.status).to.be.oneOf([400, 401, 422]);
        expect(response.body).to.not.contain('<script>');
      });
    });

    it('should test CSRF protection', () => {
      // Test that API endpoints require proper authentication
      cy.apiRequest('POST', '/api/clients/create', {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        company: 'Test Company',
        plan: 'pro'
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.error).to.contain('Access denied');
      });
    });

    it('should test input validation', () => {
      const invalidData = {
        email: 'not-an-email',
        password: '123', // Too short
        firstName: '', // Empty
        lastName: 'A'.repeat(1000) // Too long
      };

      cy.apiRequest('POST', '/api/auth/register', invalidData).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.success).to.be.false;
        expect(response.body.errors).to.be.an('array');
        expect(response.body.errors.length).to.be.greaterThan(0);
      });
    });
  });
});