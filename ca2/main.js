import {ShapeCard} from './shapecard.js';
import {MemoryGame} from './memorygame.js';

try {
  import('./firebase-config.js');
  console.log('Firebase initialized');
} catch (error) {
  console.error('Firebase init error:', error);
}

console.log('Game loaded - ShapeCard and MemoryGame imported');
