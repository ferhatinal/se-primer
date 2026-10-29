const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: false,
    viewportWidth: 390,
    viewportHeight: 844,
    video: true,
    videoCompression: false,
    trashAssetsBeforeRuns: false,
    screenshotOnRunFailure: true
  }
});
