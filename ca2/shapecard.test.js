import { ShapeCard } from './shapecard.js';

beforeEach(() => {
  const template = document.createElement('template');
  template.id = 'shape-card-template';
  template.innerHTML = `
    <style>
      .card { height: var(--card-height); width: var(--card-width); }
      .card-face-down { transform: rotateY(180deg); }
      .card-face-up { transform: rotateY(0deg); }
    </style>
    <div class="card card-face-down">
      <svg class="card-front" height="100" width="100">
        <polygon id="triangle" points="50,11 5,89 95,89" fill-opacity="0" />
        <rect id="square" height="80" width="80" x="10" y="10" fill-opacity="0" />
        <circle id="circle" r="40" cx="50" cy="50" fill-opacity="0" />
      </svg>
      <svg class="card-back" height="100" width="100" style="background-color: gray;">
        <text x="33" y="75" font-size="80" fill="black">?</text>
      </svg>
    </div>
  `;

  document.body.innerHTML = '';
  document.body.appendChild(template);

  if (!customElements.get('shape-card')) {
    customElements.define('shape-card', ShapeCard);
  }
});

// Test 1: Check getShapeTag returns correct SVG element
test('getShapeTag returns correct SVG tags', () => {
  const card = new ShapeCard();
  expect(card.getShapeTag('circle')).toBe('circle');
  expect(card.getShapeTag('square')).toBe('rect');
  expect(card.getShapeTag('triangle')).toBe('polygon');
});

// Test 2: Check random card generation creates correct amount
test('getUniqueRandomCardsAsHTML generates correct number of cards', () => {
  const html = ShapeCard.getUniqueRandomCardsAsHTML(3, true);
  const matches = html.match(/<shape-card/g);

  expect(matches).not.toBeNull();
  expect(matches.length).toBe(6);
});
