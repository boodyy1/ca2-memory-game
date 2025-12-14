// Jest configuration for memory game tests with Firebase mocks
export default {
  testEnvironment: 'jsdom',
  transform: {},
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^firebase/app$': '<rootDir>/jest.setup.js',
    '^firebase/firestore$': '<rootDir>/jest.setup.js',
    '^firebase/analytics$': '<rootDir>/jest.setup.js',
  },
};
