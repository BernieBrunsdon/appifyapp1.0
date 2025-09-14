const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    downloadsFolder: 'cypress/downloads',
    env: {
      apiUrl: 'http://localhost:3001',
      testUser: {
        email: 'test@example.com',
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'User',
        company: 'Test Company'
      }
    },
    setupNodeEvents(on, config) {
      // Add custom tasks
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        }
      });

      // Handle environment variables
      if (config.env.environment === 'staging') {
        config.baseUrl = 'https://staging.appifyai.com';
        config.env.apiUrl = 'https://staging-api.appifyai.com';
      } else if (config.env.environment === 'production') {
        config.baseUrl = 'https://app.appifyai.com';
        config.env.apiUrl = 'https://api.appifyai.com';
      }

      return config;
    }
  },
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack'
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js',
    indexHtmlFile: 'cypress/support/component-index.html'
  }
});