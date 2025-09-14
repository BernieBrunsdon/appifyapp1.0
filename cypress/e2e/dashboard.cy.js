describe('Dashboard and Navigation', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // Mock successful login
    cy.mockApi('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        user: {
          id: 'test_user_123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          company: 'Test Company',
          plan: 'pro',
          features: ['voice', 'whatsapp', 'chatbot'],
          isAdmin: false
        },
        tokens: {
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token'
        }
      }
    });

    cy.login('test@example.com', 'testpassword123');
  });

  describe('Dashboard Overview', () => {
    it('should display dashboard correctly', () => {
      cy.url().should('include', '/dashboard');
      cy.get('[data-cy=dashboard-title]').should('contain', 'Dashboard');
      cy.get('[data-cy=user-welcome]').should('contain', 'Welcome, Test User');
      cy.get('[data-cy=company-name]').should('contain', 'Test Company');
    });

    it('should display user statistics', () => {
      cy.mockApi('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: {
          success: true,
          stats: {
            totalCalls: 150,
            successRate: 95.5,
            avgDuration: 120,
            monthlyUsage: 75
          }
        }
      });

      cy.get('[data-cy=stats-container]').should('be.visible');
      cy.get('[data-cy=total-calls]').should('contain', '150');
      cy.get('[data-cy=success-rate]').should('contain', '95.5%');
      cy.get('[data-cy=avg-duration]').should('contain', '120');
      cy.get('[data-cy=monthly-usage]').should('contain', '75%');
    });

    it('should display recent activity', () => {
      cy.mockApi('GET', '/api/dashboard/activity', {
        statusCode: 200,
        body: {
          success: true,
          activities: [
            {
              id: '1',
              type: 'call',
              description: 'Incoming call from +1234567890',
              timestamp: '2024-01-15T10:30:00Z',
              status: 'completed'
            },
            {
              id: '2',
              type: 'message',
              description: 'WhatsApp message received',
              timestamp: '2024-01-15T09:15:00Z',
              status: 'processed'
            }
          ]
        }
      });

      cy.get('[data-cy=recent-activity]').should('be.visible');
      cy.get('[data-cy=activity-item]').should('have.length.at.least', 1);
    });

    it('should display quick actions', () => {
      cy.get('[data-cy=quick-actions]').should('be.visible');
      cy.get('[data-cy=create-agent-button]').should('be.visible');
      cy.get('[data-cy=view-analytics-button]').should('be.visible');
      cy.get('[data-cy=manage-settings-button]').should('be.visible');
    });
  });

  describe('Navigation', () => {
    it('should navigate to agents page', () => {
      cy.mockApi('GET', '/api/agents', {
        statusCode: 200,
        body: {
          success: true,
          agents: [
            {
              id: 'agent_1',
              name: 'Customer Support Agent',
              status: 'active',
              callsHandled: 50,
              lastActive: '2024-01-15T10:30:00Z'
            }
          ]
        }
      });

      cy.get('[data-cy=agents-nav-link]').click();
      cy.url().should('include', '/agents');
      cy.get('[data-cy=agents-title]').should('contain', 'Agents');
    });

    it('should navigate to analytics page', () => {
      cy.mockApi('GET', '/api/analytics', {
        statusCode: 200,
        body: {
          success: true,
          analytics: {
            calls: {
              total: 150,
              successful: 143,
              failed: 7,
              avgDuration: 120
            },
            messages: {
              total: 300,
              responses: 285,
              avgResponseTime: 5
            }
          }
        }
      });

      cy.get('[data-cy=analytics-nav-link]').click();
      cy.url().should('include', '/analytics');
      cy.get('[data-cy=analytics-title]').should('contain', 'Analytics');
    });

    it('should navigate to settings page', () => {
      cy.mockApi('GET', '/api/settings', {
        statusCode: 200,
        body: {
          success: true,
          settings: {
            notifications: true,
            emailAlerts: true,
            smsAlerts: false,
            timezone: 'UTC'
          }
        }
      });

      cy.get('[data-cy=settings-nav-link]').click();
      cy.url().should('include', '/settings');
      cy.get('[data-cy=settings-title]').should('contain', 'Settings');
    });

    it('should navigate to profile page', () => {
      cy.mockApi('GET', '/api/auth/me', {
        statusCode: 200,
        body: {
          success: true,
          user: {
            id: 'test_user_123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            company: 'Test Company',
            plan: 'pro',
            features: ['voice', 'whatsapp', 'chatbot'],
            isAdmin: false
          }
        }
      });

      cy.get('[data-cy=user-menu]').click();
      cy.get('[data-cy=profile-link]').click();
      cy.url().should('include', '/profile');
      cy.get('[data-cy=profile-title]').should('contain', 'Profile');
    });

    it('should show mobile navigation menu', () => {
      cy.viewport('iphone-x');
      cy.get('[data-cy=mobile-menu-button]').should('be.visible');
      cy.get('[data-cy=mobile-menu-button]').click();
      cy.get('[data-cy=mobile-nav-menu]').should('be.visible');
    });

    it('should hide mobile navigation menu', () => {
      cy.viewport('iphone-x');
      cy.get('[data-cy=mobile-menu-button]').click();
      cy.get('[data-cy=mobile-nav-menu]').should('be.visible');
      cy.get('[data-cy=mobile-menu-close]').click();
      cy.get('[data-cy=mobile-nav-menu]').should('not.be.visible');
    });
  });

  describe('Agent Management', () => {
    beforeEach(() => {
      cy.get('[data-cy=agents-nav-link]').click();
    });

    it('should display agents list', () => {
      cy.mockApi('GET', '/api/agents', {
        statusCode: 200,
        body: {
          success: true,
          agents: [
            {
              id: 'agent_1',
              name: 'Customer Support Agent',
              status: 'active',
              callsHandled: 50,
              lastActive: '2024-01-15T10:30:00Z',
              features: ['voice', 'whatsapp']
            },
            {
              id: 'agent_2',
              name: 'Sales Agent',
              status: 'inactive',
              callsHandled: 25,
              lastActive: '2024-01-14T15:20:00Z',
              features: ['voice']
            }
          ]
        }
      });

      cy.get('[data-cy=agents-list]').should('be.visible');
      cy.get('[data-cy=agent-card]').should('have.length', 2);
      cy.get('[data-cy=agent-name]').first().should('contain', 'Customer Support Agent');
      cy.get('[data-cy=agent-status]').first().should('contain', 'Active');
    });

    it('should create new agent', () => {
      cy.mockApi('POST', '/api/agents', {
        statusCode: 201,
        body: {
          success: true,
          message: 'Agent created successfully',
          agent: {
            id: 'new_agent_123',
            name: 'New Agent',
            status: 'active',
            callsHandled: 0,
            lastActive: new Date().toISOString(),
            features: ['voice', 'whatsapp', 'chatbot']
          }
        }
      });

      cy.get('[data-cy=create-agent-button]').click();
      cy.get('[data-cy=agent-name-input]').type('New Agent');
      cy.get('[data-cy=agent-voice-select]').select('alloy');
      cy.get('[data-cy=agent-first-message]').type('Hello! How can I help you today?');
      cy.get('[data-cy=agent-system-prompt]').type('You are a helpful customer support agent.');
      cy.get('[data-cy=create-agent-submit]').click();

      cy.get('[data-cy=success-message]').should('contain', 'Agent created successfully');
      cy.get('[data-cy=agent-card]').should('have.length', 1);
    });

    it('should edit existing agent', () => {
      cy.mockApi('GET', '/api/agents', {
        statusCode: 200,
        body: {
          success: true,
          agents: [
            {
              id: 'agent_1',
              name: 'Customer Support Agent',
              status: 'active',
              callsHandled: 50,
              lastActive: '2024-01-15T10:30:00Z',
              features: ['voice', 'whatsapp']
            }
          ]
        }
      });

      cy.mockApi('PUT', '/api/agents/agent_1', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Agent updated successfully'
        }
      });

      cy.get('[data-cy=agent-card]').first().click();
      cy.get('[data-cy=edit-agent-button]').click();
      cy.get('[data-cy=agent-name-input]').clear().type('Updated Agent Name');
      cy.get('[data-cy=save-agent-button]').click();

      cy.get('[data-cy=success-message]').should('contain', 'Agent updated successfully');
    });

    it('should delete agent', () => {
      cy.mockApi('GET', '/api/agents', {
        statusCode: 200,
        body: {
          success: true,
          agents: [
            {
              id: 'agent_1',
              name: 'Customer Support Agent',
              status: 'active',
              callsHandled: 50,
              lastActive: '2024-01-15T10:30:00Z',
              features: ['voice', 'whatsapp']
            }
          ]
        }
      });

      cy.mockApi('DELETE', '/api/agents/agent_1', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Agent deleted successfully'
        }
      });

      cy.get('[data-cy=agent-card]').first().click();
      cy.get('[data-cy=delete-agent-button]').click();
      cy.get('[data-cy=confirm-delete-button]').click();

      cy.get('[data-cy=success-message]').should('contain', 'Agent deleted successfully');
      cy.get('[data-cy=agent-card]').should('not.exist');
    });
  });

  describe('Analytics Dashboard', () => {
    beforeEach(() => {
      cy.get('[data-cy=analytics-nav-link]').click();
    });

    it('should display analytics overview', () => {
      cy.mockApi('GET', '/api/analytics', {
        statusCode: 200,
        body: {
          success: true,
          analytics: {
            calls: {
              total: 150,
              successful: 143,
              failed: 7,
              avgDuration: 120
            },
            messages: {
              total: 300,
              responses: 285,
              avgResponseTime: 5
            },
            performance: {
              uptime: 99.9,
              responseTime: 150,
              errorRate: 2.1
            }
          }
        }
      });

      cy.get('[data-cy=analytics-overview]').should('be.visible');
      cy.get('[data-cy=calls-total]').should('contain', '150');
      cy.get('[data-cy=calls-successful]').should('contain', '143');
      cy.get('[data-cy=messages-total]').should('contain', '300');
      cy.get('[data-cy=performance-uptime]').should('contain', '99.9%');
    });

    it('should display charts and graphs', () => {
      cy.mockApi('GET', '/api/analytics/charts', {
        statusCode: 200,
        body: {
          success: true,
          charts: {
            callsOverTime: [
              { date: '2024-01-01', calls: 10 },
              { date: '2024-01-02', calls: 15 },
              { date: '2024-01-03', calls: 12 }
            ],
            successRate: [
              { date: '2024-01-01', rate: 95 },
              { date: '2024-01-02', rate: 98 },
              { date: '2024-01-03', rate: 96 }
            ]
          }
        }
      });

      cy.get('[data-cy=charts-container]').should('be.visible');
      cy.get('[data-cy=calls-chart]').should('be.visible');
      cy.get('[data-cy=success-rate-chart]').should('be.visible');
    });

    it('should filter analytics by date range', () => {
      cy.get('[data-cy=date-range-selector]').click();
      cy.get('[data-cy=last-7-days]').click();
      
      cy.mockApi('GET', '/api/analytics?range=7d', {
        statusCode: 200,
        body: {
          success: true,
          analytics: {
            calls: { total: 50, successful: 48, failed: 2, avgDuration: 110 },
            messages: { total: 100, responses: 95, avgResponseTime: 4 }
          }
        }
      });

      cy.get('[data-cy=calls-total]').should('contain', '50');
      cy.get('[data-cy=messages-total]').should('contain', '100');
    });
  });

  describe('Settings Management', () => {
    beforeEach(() => {
      cy.get('[data-cy=settings-nav-link]').click();
    });

    it('should display settings form', () => {
      cy.mockApi('GET', '/api/settings', {
        statusCode: 200,
        body: {
          success: true,
          settings: {
            notifications: true,
            emailAlerts: true,
            smsAlerts: false,
            timezone: 'UTC',
            language: 'en',
            theme: 'light'
          }
        }
      });

      cy.get('[data-cy=settings-form]').should('be.visible');
      cy.get('[data-cy=notifications-toggle]').should('be.checked');
      cy.get('[data-cy=email-alerts-toggle]').should('be.checked');
      cy.get('[data-cy=sms-alerts-toggle]').should('not.be.checked');
      cy.get('[data-cy=timezone-select]').should('have.value', 'UTC');
    });

    it('should update settings', () => {
      cy.mockApi('PUT', '/api/settings', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Settings updated successfully'
        }
      });

      cy.get('[data-cy=sms-alerts-toggle]').check();
      cy.get('[data-cy=timezone-select]').select('America/New_York');
      cy.get('[data-cy=save-settings-button]').click();

      cy.get('[data-cy=success-message]').should('contain', 'Settings updated successfully');
    });

    it('should display account information', () => {
      cy.get('[data-cy=account-section]').should('be.visible');
      cy.get('[data-cy=plan-info]').should('contain', 'Pro Plan');
      cy.get('[data-cy=features-list]').should('contain', 'Voice');
      cy.get('[data-cy=features-list]').should('contain', 'WhatsApp');
      cy.get('[data-cy=features-list]').should('contain', 'Chatbot');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile devices', () => {
      cy.viewport('iphone-x');
      cy.get('[data-cy=mobile-menu-button]').should('be.visible');
      cy.get('[data-cy=dashboard-title]').should('be.visible');
      cy.get('[data-cy=stats-container]').should('be.visible');
    });

    it('should work on tablet devices', () => {
      cy.viewport('ipad-2');
      cy.get('[data-cy=dashboard-title]').should('be.visible');
      cy.get('[data-cy=stats-container]').should('be.visible');
      cy.get('[data-cy=quick-actions]').should('be.visible');
    });

    it('should work on desktop devices', () => {
      cy.viewport(1920, 1080);
      cy.get('[data-cy=dashboard-title]').should('be.visible');
      cy.get('[data-cy=stats-container]').should('be.visible');
      cy.get('[data-cy=quick-actions]').should('be.visible');
      cy.get('[data-cy=recent-activity]').should('be.visible');
    });
  });
});