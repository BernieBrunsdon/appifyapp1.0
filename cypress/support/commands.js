// Custom commands for Cypress testing

// Authentication commands
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-cy=email-input]').type(email);
  cy.get('[data-cy=password-input]').type(password);
  cy.get('[data-cy=login-button]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('register', (userData) => {
  cy.visit('/register');
  cy.get('[data-cy=firstName-input]').type(userData.firstName);
  cy.get('[data-cy=lastName-input]').type(userData.lastName);
  cy.get('[data-cy=email-input]').type(userData.email);
  cy.get('[data-cy=password-input]').type(userData.password);
  cy.get('[data-cy=company-input]').type(userData.company);
  cy.get('[data-cy=phone-input]').type(userData.phone || '+1234567890');
  cy.get('[data-cy=plan-select]').select(userData.plan || 'pro');
  cy.get('[data-cy=register-button]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-cy=user-menu]').click();
  cy.get('[data-cy=logout-button]').click();
  cy.url().should('include', '/login');
});

// API commands
Cypress.Commands.add('apiRequest', (method, endpoint, body, headers = {}) => {
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

Cypress.Commands.add('apiLogin', (email, password) => {
  return cy.apiRequest('POST', '/api/auth/login', {
    email,
    password
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body.success).to.be.true;
    return response.body.tokens.accessToken;
  });
});

// Element selection commands
Cypress.Commands.add('getByDataCy', (selector) => {
  return cy.get(`[data-cy="${selector}"]`);
});

Cypress.Commands.add('getByTestId', (selector) => {
  return cy.get(`[data-testid="${selector}"]`);
});

// Form commands
Cypress.Commands.add('fillForm', (formData) => {
  Object.keys(formData).forEach(key => {
    cy.get(`[data-cy="${key}-input"]`).type(formData[key]);
  });
});

Cypress.Commands.add('submitForm', (formSelector = '[data-cy=form]') => {
  cy.get(formSelector).submit();
});

// Wait commands
Cypress.Commands.add('waitForElement', (selector, timeout = 10000) => {
  cy.get(selector, { timeout }).should('be.visible');
});

Cypress.Commands.add('waitForText', (text, timeout = 10000) => {
  cy.contains(text, { timeout }).should('be.visible');
});

// Navigation commands
Cypress.Commands.add('navigateTo', (path) => {
  cy.visit(path);
  cy.url().should('include', path);
});

// Assertion commands
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

// File upload commands
Cypress.Commands.add('uploadFile', (selector, filePath) => {
  cy.get(selector).selectFile(filePath);
});

// Performance commands
Cypress.Commands.add('measurePerformance', (name) => {
  cy.window().then((win) => {
    const performance = win.performance;
    const navigation = performance.getEntriesByType('navigation')[0];
    
    cy.log(`Performance metrics for ${name}:`);
    cy.log(`- Load time: ${navigation.loadEventEnd - navigation.loadEventStart}ms`);
    cy.log(`- DOM content loaded: ${navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}ms`);
  });
});

// Accessibility commands
Cypress.Commands.add('checkA11y', () => {
  cy.injectAxe();
  cy.checkA11y();
});

// Mock commands
Cypress.Commands.add('mockApi', (method, url, response) => {
  cy.intercept(method, url, response).as(`api_${method.toLowerCase()}_${url.replace(/[^a-zA-Z0-9]/g, '_')}`);
});

// Environment commands
Cypress.Commands.add('isProduction', () => {
  return Cypress.env('environment') === 'production';
});

Cypress.Commands.add('isStaging', () => {
  return Cypress.env('environment') === 'staging';
});

Cypress.Commands.add('isDevelopment', () => {
  return Cypress.env('environment') === 'development';
});