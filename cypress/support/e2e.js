// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing the test on uncaught exceptions
  // that are not related to the application under test
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }
  // Return true to let Cypress fail the test for other errors
  return true;
});

// Global configuration
beforeEach(() => {
  // Clear localStorage before each test
  cy.clearLocalStorage();
  
  // Clear cookies before each test
  cy.clearCookies();
  
  // Set default viewport
  cy.viewport(1280, 720);
});

// Global after hook
afterEach(() => {
  // Take screenshot on test failure
  if (Cypress.currentTest.state === 'failed') {
    cy.screenshot();
  }
});

// Custom commands for common actions
Cypress.Commands.add('login', (email = Cypress.env('testUser').email, password = Cypress.env('testUser').password) => {
  cy.visit('/login');
  cy.get('[data-cy=email-input]').type(email);
  cy.get('[data-cy=password-input]').type(password);
  cy.get('[data-cy=login-button]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('register', (userData = Cypress.env('testUser')) => {
  cy.visit('/register');
  cy.get('[data-cy=firstName-input]').type(userData.firstName);
  cy.get('[data-cy=lastName-input]').type(userData.lastName);
  cy.get('[data-cy=email-input]').type(userData.email);
  cy.get('[data-cy=password-input]').type(userData.password);
  cy.get('[data-cy=company-input]').type(userData.company);
  cy.get('[data-cy=phone-input]').type('+1234567890');
  cy.get('[data-cy=plan-select]').select('pro');
  cy.get('[data-cy=register-button]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-cy=user-menu]').click();
  cy.get('[data-cy=logout-button]').click();
  cy.url().should('include', '/login');
});

Cypress.Commands.add('waitForApi', (alias) => {
  cy.wait(alias);
});

Cypress.Commands.add('mockApi', (method, url, response) => {
  cy.intercept(method, url, response).as(`api_${method.toLowerCase()}_${url.replace(/[^a-zA-Z0-9]/g, '_')}`);
});

Cypress.Commands.add('checkLoadingState', () => {
  cy.get('[data-cy=loading]').should('be.visible');
  cy.get('[data-cy=loading]').should('not.exist');
});

Cypress.Commands.add('checkErrorMessage', (message) => {
  cy.get('[data-cy=error-message]').should('be.visible');
  cy.get('[data-cy=error-message]').should('contain', message);
});

Cypress.Commands.add('checkSuccessMessage', (message) => {
  cy.get('[data-cy=success-message]').should('be.visible');
  cy.get('[data-cy=success-message]').should('contain', message);
});

// Custom assertions
Cypress.Commands.add('shouldHaveText', { prevSubject: true }, (subject, text) => {
  cy.wrap(subject).should('contain.text', text);
});

Cypress.Commands.add('shouldBeVisible', { prevSubject: true }, (subject) => {
  cy.wrap(subject).should('be.visible');
});

Cypress.Commands.add('shouldBeHidden', { prevSubject: true }, (subject) => {
  cy.wrap(subject).should('not.be.visible');
});

Cypress.Commands.add('shouldBeEnabled', { prevSubject: true }, (subject) => {
  cy.wrap(subject).should('not.be.disabled');
});

Cypress.Commands.add('shouldBeDisabled', { prevSubject: true }, (subject) => {
  cy.wrap(subject).should('be.disabled');
});

// API testing helpers
Cypress.Commands.add('apiRequest', (method, endpoint, body = null, headers = {}) => {
  const options = {
    method,
    url: `${Cypress.env('apiUrl')}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (body) {
    options.body = body;
  }

  return cy.request(options);
});

Cypress.Commands.add('apiLogin', (email = Cypress.env('testUser').email, password = Cypress.env('testUser').password) => {
  return cy.apiRequest('POST', '/api/auth/login', {
    email,
    password
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body.success).to.be.true;
    return response.body.tokens.accessToken;
  });
});

Cypress.Commands.add('apiRegister', (userData = Cypress.env('testUser')) => {
  return cy.apiRequest('POST', '/api/auth/register', {
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    password: userData.password,
    company: userData.company,
    phone: '+1234567890',
    plan: 'pro'
  }).then((response) => {
    expect(response.status).to.eq(201);
    expect(response.body.success).to.be.true;
    return response.body.tokens.accessToken;
  });
});

// Database helpers (if needed)
Cypress.Commands.add('seedDatabase', () => {
  // Add database seeding commands if needed
  cy.log('Seeding database...');
});

Cypress.Commands.add('cleanDatabase', () => {
  // Add database cleaning commands if needed
  cy.log('Cleaning database...');
});

// Performance testing helpers
Cypress.Commands.add('measurePerformance', (name) => {
  cy.window().then((win) => {
    const performance = win.performance;
    const navigation = performance.getEntriesByType('navigation')[0];
    
    cy.log(`Performance metrics for ${name}:`);
    cy.log(`- Load time: ${navigation.loadEventEnd - navigation.loadEventStart}ms`);
    cy.log(`- DOM content loaded: ${navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}ms`);
    cy.log(`- First paint: ${performance.getEntriesByType('paint')[0]?.startTime || 'N/A'}ms`);
  });
});

// Accessibility testing helpers
Cypress.Commands.add('checkA11y', () => {
  cy.injectAxe();
  cy.checkA11y();
});

// Custom data attributes for testing
Cypress.Commands.add('getByDataCy', (selector) => {
  return cy.get(`[data-cy="${selector}"]`);
});

Cypress.Commands.add('getByTestId', (selector) => {
  return cy.get(`[data-testid="${selector}"]`);
});

// File upload helpers
Cypress.Commands.add('uploadFile', (selector, filePath) => {
  cy.get(selector).selectFile(filePath);
});

// Form helpers
Cypress.Commands.add('fillForm', (formData) => {
  Object.keys(formData).forEach(key => {
    cy.get(`[data-cy="${key}-input"]`).type(formData[key]);
  });
});

Cypress.Commands.add('submitForm', (formSelector = '[data-cy=form]') => {
  cy.get(formSelector).submit();
});

// Navigation helpers
Cypress.Commands.add('navigateTo', (path) => {
  cy.visit(path);
  cy.url().should('include', path);
});

Cypress.Commands.add('goBack', () => {
  cy.go('back');
});

Cypress.Commands.add('goForward', () => {
  cy.go('forward');
});

// Wait helpers
Cypress.Commands.add('waitForElement', (selector, timeout = 10000) => {
  cy.get(selector, { timeout }).should('be.visible');
});

Cypress.Commands.add('waitForText', (text, timeout = 10000) => {
  cy.contains(text, { timeout }).should('be.visible');
});

// Mock helpers
Cypress.Commands.add('mockGraphQL', (operationName, response) => {
  cy.intercept('POST', '/graphql', (req) => {
    if (req.body.operationName === operationName) {
      req.reply(response);
    }
  });
});

// Environment helpers
Cypress.Commands.add('isProduction', () => {
  return Cypress.env('environment') === 'production';
});

Cypress.Commands.add('isStaging', () => {
  return Cypress.env('environment') === 'staging';
});

Cypress.Commands.add('isDevelopment', () => {
  return Cypress.env('environment') === 'development';
});