import { jest } from '@jest/globals';
import { MemoryGame } from './memorygame.js';
import { ShapeCard } from './shapecard.js';

global.window = global.window || {};
global.window.db = { collection: jest.fn() };

beforeEach(() => {
  const template = document.createElement('template');
  template.id = 'shape-card-template';
  template.innerHTML = `
    <div class="card card-face-down">
      <svg class="card-front" height="100" width="100">
        <polygon id="triangle" points="50,11 5,89 95,89" fill-opacity="0" />
        <rect id="square" height="80" width="80" x="10" y="10" fill-opacity="0" />
        <circle id="circle" r="40" cx="50" cy="50" fill-opacity="0" />
      </svg>
      <svg class="card-back" height="100" width="100">
        <text x="33" y="75" font-size="80" fill="black">?</text>
      </svg>
    </div>
  `;

  document.body.innerHTML = '';
  document.body.appendChild(template);

  if (!customElements.get('shape-card')) {
    customElements.define('shape-card', ShapeCard);
  }
  if (!customElements.get('memory-game')) {
    customElements.define('memory-game', MemoryGame);
  }
});

// Test 1: Check game initializes with correct values
test('game starts with correct initial values', () => {
  const game = new MemoryGame();

  expect(game.flippedCards).toEqual([]);
  expect(game.matchedPairs).toBe(0);
  expect(game.movesCount).toBe(0);
  expect(game.isChecking).toBe(false);
});

// Test 2: Check updateStats changes the display
test('updateStats updates the display', () => {
  const game = new MemoryGame();

  const container = document.createElement('div');
  container.innerHTML = '<p>Moves: <span id="moves">0</span> | Pairs Found: <span id="pairs">0</span>/6</p>';
  game.shadowRoot.appendChild(container);

  game.movesCount = 5;
  game.matchedPairs = 3;
  game.updateStats();

  expect(game.shadowRoot.querySelector('#moves').textContent).toBe('5');
  expect(game.shadowRoot.querySelector('#pairs').textContent).toBe('3');
});
