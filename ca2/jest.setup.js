import { jest } from '@jest/globals';

export const initializeApp = jest.fn(() => ({}));
export const getAnalytics = jest.fn();

export const getFirestore = jest.fn(() => ({}));
export const collection = jest.fn();
export const addDoc = jest.fn();
export const serverTimestamp = jest.fn();
export const getDocs = jest.fn();
export const query = jest.fn();
export const where = jest.fn();

export const db = {};
export const analytics = {};

if (typeof window !== 'undefined') {
  global.HTMLElement = window.HTMLElement;
  global.HTMLTemplateElement = window.HTMLTemplateElement;
  global.ShadowRoot = window.ShadowRoot;
}
