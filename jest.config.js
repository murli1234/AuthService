// jest.config.js
export default {
  testEnvironment: "node",
  transform: {}, // Necessary for ES Modules if no Babel/TS is used
  clearMocks: true, // Automatically clear mock calls and instances between every test
  coverageDirectory: "coverage", // Directory where coverage reports are stored
  coverageProvider: "v8", // Use V8's built-in coverage for better performance
  collectCoverage: true, // Enable coverage collection
  coveragePathIgnorePatterns: [ // Exclude files from coverage
    "/node_modules/",
    "/src/config/", // Often difficult/unnecessary to test directly
    "/src/index.js", // Entry point, tested implicitly via integration tests
    "/src/utils/logger.js" // Example utility that might not need coverage
  ],
  coverageThreshold: { // Optional: Enforce coverage minimums
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  // Automatically look for test files in the __tests__ directory OR files ending with .test.js or .spec.js
  // testMatch: [
  //   "**/__tests__/**/*.js?(x)",
  //   "**/?(*.)+(spec|test).js?(x)"
  // ],
};
