/**
 * Jest Configuration for DiceRoller_CSB430
 *
 * ---
 * NOTE: This file was created with AI assistance (Qwen Code).
 * ---
 */

module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(sql)$': '<rootDir>/jest.setup.js',
  },
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(test).js'],
  // Reset mocks before each test file
  resetMocks: true,
  // Clear modules to ensure mocks are applied correctly
  resetModules: true,
};
