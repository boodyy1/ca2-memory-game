import { jest } from '@jest/globals';

// Mock Firebase modules before any imports
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}), { virtual: true });

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  getDocs: jest.fn(),
}), { virtual: true });

jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(),
}), { virtual: true });

// Mock the firebase-config module
jest.mock('./firebase-config.js', () => ({
  db: {},
  analytics: {},
}), { virtual: true });
