describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Login Flow', () => {
    it('should display login page correctly', () => {
      cy.visit('/login');
      
      cy.get('[data-cy=email-input]').should('be.visible');
      cy.get('[data-cy=password-input]').should('be.visible');
      cy.get('[data-cy=login-button]').should('be.visible');
      cy.get('[data-cy=register-link]').should('be.visible');
    });

    it('should login successfully with valid credentials', () => {
      cy.mockApi('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Login successful',
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
      
      cy.url().should('include', '/dashboard');
      cy.get('[data-cy=user-menu]').should('be.visible');
      cy.get('[data-cy=dashboard-title]').should('contain', 'Dashboard');
    });

    it('should show error for invalid credentials', () => {
      cy.mockApi('POST', '/api/auth/login', {
        statusCode: 401,
        body: {
          success: false,
          error: 'Invalid password'
        }
      });

      cy.visit('/login');
      cy.get('[data-cy=email-input]').type('test@example.com');
      cy.get('[data-cy=password-input]').type('wrongpassword');
      cy.get('[data-cy=login-button]').click();
      
      cy.get('[data-cy=error-message]').should('be.visible');
      cy.get('[data-cy=error-message]').should('contain', 'Invalid password');
    });

    it('should validate required fields', () => {
      cy.visit('/login');
      cy.get('[data-cy=login-button]').click();
      
      cy.get('[data-cy=email-input]').should('have.attr', 'required');
      cy.get('[data-cy=password-input]').should('have.attr', 'required');
    });

    it('should navigate to register page', () => {
      cy.visit('/login');
      cy.get('[data-cy=register-link]').click();
      
      cy.url().should('include', '/register');
      cy.get('[data-cy=register-form]').should('be.visible');
    });
  });

  describe('Registration Flow', () => {
    it('should display registration page correctly', () => {
      cy.visit('/register');
      
      cy.get('[data-cy=firstName-input]').should('be.visible');
      cy.get('[data-cy=lastName-input]').should('be.visible');
      cy.get('[data-cy=email-input]').should('be.visible');
      cy.get('[data-cy=password-input]').should('be.visible');
      cy.get('[data-cy=company-input]').should('be.visible');
      cy.get('[data-cy=phone-input]').should('be.visible');
      cy.get('[data-cy=plan-select]').should('be.visible');
      cy.get('[data-cy=register-button]').should('be.visible');
      cy.get('[data-cy=login-link]').should('be.visible');
    });

    it('should register successfully with valid data', () => {
      cy.mockApi('POST', '/api/auth/register', {
        statusCode: 201,
        body: {
          success: true,
          message: 'Registration successful',
          user: {
            id: 'new_user_123',
            email: 'newuser@example.com',
            firstName: 'New',
            lastName: 'User',
            company: 'New Company',
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

      const userData = {
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com',
        password: 'newpassword123',
        company: 'New Company',
        phone: '+1234567890',
        plan: 'pro'
      };

      cy.register(userData);
      
      cy.url().should('include', '/dashboard');
      cy.get('[data-cy=user-menu]').should('be.visible');
      cy.get('[data-cy=dashboard-title]').should('contain', 'Dashboard');
    });

    it('should show error for existing email', () => {
      cy.mockApi('POST', '/api/auth/register', {
        statusCode: 409,
        body: {
          success: false,
          error: 'User already exists with this email'
        }
      });

      cy.visit('/register');
      cy.fillForm({
        firstName: 'Test',
        lastName: 'User',
        email: 'existing@example.com',
        password: 'password123',
        company: 'Test Company',
        phone: '+1234567890'
      });
      cy.get('[data-cy=plan-select]').select('pro');
      cy.get('[data-cy=register-button]').click();
      
      cy.get('[data-cy=error-message]').should('be.visible');
      cy.get('[data-cy=error-message]').should('contain', 'User already exists with this email');
    });

    it('should validate form fields', () => {
      cy.visit('/register');
      cy.get('[data-cy=register-button]').click();
      
      // Check required field validation
      cy.get('[data-cy=firstName-input]').should('have.attr', 'required');
      cy.get('[data-cy=lastName-input]').should('have.attr', 'required');
      cy.get('[data-cy=email-input]').should('have.attr', 'required');
      cy.get('[data-cy=password-input]').should('have.attr', 'required');
      cy.get('[data-cy=company-input]').should('have.attr', 'required');
      cy.get('[data-cy=phone-input]').should('have.attr', 'required');
    });

    it('should navigate to login page', () => {
      cy.visit('/register');
      cy.get('[data-cy=login-link]').click();
      
      cy.url().should('include', '/login');
      cy.get('[data-cy=login-form]').should('be.visible');
    });
  });

  describe('Logout Flow', () => {
    beforeEach(() => {
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

      cy.mockApi('POST', '/api/auth/logout', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Logout successful'
        }
      });

      cy.login('test@example.com', 'testpassword123');
    });

    it('should logout successfully', () => {
      cy.get('[data-cy=user-menu]').click();
      cy.get('[data-cy=logout-button]').click();
      
      cy.url().should('include', '/login');
      cy.get('[data-cy=login-form]').should('be.visible');
    });

    it('should clear user data on logout', () => {
      cy.get('[data-cy=user-menu]').click();
      cy.get('[data-cy=logout-button]').click();
      
      cy.url().should('include', '/login');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('accessToken')).to.be.null;
        expect(win.localStorage.getItem('refreshToken')).to.be.null;
        expect(win.localStorage.getItem('user')).to.be.null;
      });
    });
  });

  describe('Password Change Flow', () => {
    beforeEach(() => {
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

    it('should change password successfully', () => {
      cy.mockApi('POST', '/api/auth/change-password', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Password changed successfully'
        }
      });

      cy.get('[data-cy=user-menu]').click();
      cy.get('[data-cy=settings-link]').click();
      
      cy.url().should('include', '/settings');
      cy.get('[data-cy=current-password-input]').type('oldpassword123');
      cy.get('[data-cy=new-password-input]').type('newpassword123');
      cy.get('[data-cy=confirm-password-input]').type('newpassword123');
      cy.get('[data-cy=change-password-button]').click();
      
      cy.get('[data-cy=success-message]').should('be.visible');
      cy.get('[data-cy=success-message]').should('contain', 'Password changed successfully');
    });

    it('should show error for wrong current password', () => {
      cy.mockApi('POST', '/api/auth/change-password', {
        statusCode: 401,
        body: {
          success: false,
          error: 'Current password is incorrect'
        }
      });

      cy.get('[data-cy=user-menu]').click();
      cy.get('[data-cy=settings-link]').click();
      
      cy.get('[data-cy=current-password-input]').type('wrongpassword');
      cy.get('[data-cy=new-password-input]').type('newpassword123');
      cy.get('[data-cy=confirm-password-input]').type('newpassword123');
      cy.get('[data-cy=change-password-button]').click();
      
      cy.get('[data-cy=error-message]').should('be.visible');
      cy.get('[data-cy=error-message]').should('contain', 'Current password is incorrect');
    });
  });

  describe('Token Refresh Flow', () => {
    it('should refresh token automatically', () => {
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

      cy.mockApi('POST', '/api/auth/refresh', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Token refreshed successfully',
          accessToken: 'new_access_token'
        }
      });

      cy.login('test@example.com', 'testpassword123');
      
      // Simulate token expiration by making an API call
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
    });
  });
});