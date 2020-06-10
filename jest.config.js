module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
