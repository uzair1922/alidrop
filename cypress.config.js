const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://app.alidrop.co/',
    env: {
      email: "qa+auto123@spocket.co",
      password: "Spocket@2025",
      productUrl: "https://www.aliexpress.com/item/1005006861101379.html"
    },
    defaultCommandTimeout: 20000, // 20 seconds
    pageLoadTimeout: 30000, // 30s
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
