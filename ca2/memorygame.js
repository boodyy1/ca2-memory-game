import {ShapeCard} from './shapecard.js';

/* custom element for memory card game 
   takes size attribute in format 'rowsxcols' e.g. '3x4' 
   
   methods:
   - handles card clicks
   - checks for matches
   - tracks game state
*/

export class MemoryGame extends HTMLElement {
    static observedAttributes = ["size"];

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // game state variables
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.movesCount = 0;
        this.isChecking = false;
    }

    connectedCallback() {
        const sizeAttr = this.getAttribute('size');
        if (!sizeAttr) {
            throw new Error('size attribute is required');
        }

        // parse the size attribute
        const parts = sizeAttr.toLowerCase().split('x');
        if (parts.length !== 2) {
            throw new Error('size must be in format rowsxcols e.g. 3x4');
        }

        const rows = parseInt(parts[0]);
        const cols = parseInt(parts[1]);

        if (isNaN(rows) || isNaN(cols)) {
            throw new Error('rows and columns must be numbers');
        }

        const totalCards = rows * cols;
        if (totalCards % 2 !== 0) {
            throw new Error('total number of cards must be even');
        }

        this.totalPairs = totalCards / 2;

        // create the game board
        this.#setupGame(rows, cols);
    }

    #setupGame(rows, cols) {
        // create container for game
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '20px';
        container.style.padding = '20px';

        // add heading
        const heading = document.createElement('h1');
        heading.textContent = 'Memory Card Game';
        container.appendChild(heading);

        // stats display
        const stats = document.createElement('div');
        stats.id = 'stats';
        stats.innerHTML = `<p>Moves: <span id="moves">0</span> | Pairs Found: <span id="pairs">0</span>/${this.totalPairs}</p>`;
        container.appendChild(stats);

        // game board
        const board = document.createElement('div');
        board.id = 'game-board';
        board.style.display = 'grid';
        board.style.gridTemplateColumns = `repeat(${cols}, 100px)`;
        board.style.gridTemplateRows = `repeat(${rows}, 100px)`;
        board.style.gap = '10px';

        // get the cards html
        const cardsHTML = ShapeCard.getUniqueRandomCardsAsHTML(this.totalPairs, true);
        board.innerHTML = cardsHTML;

        container.appendChild(board);

        // win message div
        const winMsg = document.createElement('div');
        winMsg.id = 'win-message';
        winMsg.style.display = 'none';
        winMsg.style.fontSize = '24px';
        winMsg.style.color = 'green';
        winMsg.style.fontWeight = 'bold';
        container.appendChild(winMsg);

        this.shadowRoot.appendChild(container);

        // add click handlers to all cards
        this.#attachCardListeners();
    }

    #attachCardListeners() {
        const cards = this.shadowRoot.querySelectorAll('shape-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => this.#handleCardClick(e));
        });
    }

    #handleCardClick(event) {
        const clickedCard = event.target;

        // prevent clicking if already checking two cards
        if (this.isChecking) {
            return;
        }

        // can't click already matched cards
        if (clickedCard.hasAttribute('matched')) {
            return;
        }

        // can't click the same card twice
        if (this.flippedCards.includes(clickedCard)) {
            return;
        }

        // flip the card
        if (!clickedCard.isFaceUp()) {
            clickedCard.flip();
            this.flippedCards.push(clickedCard);
        }

        // check if we have two cards flipped
        if (this.flippedCards.length === 2) {
            this.movesCount++;
            this.#updateStats();
            this.isChecking = true;

            // check for match after a delay
            setTimeout(() => {
                this.#checkForMatch();
            }, 1000);
        }
    }

    #checkForMatch() {
        const card1 = this.flippedCards[0];
        const card2 = this.flippedCards[1];

        // get the attributes to compare
        const type1 = card1.getAttribute('type');
        const colour1 = card1.getAttribute('colour');
        const type2 = card2.getAttribute('type');
        const colour2 = card2.getAttribute('colour');

        // check if they match
        if (type1 === type2 && colour1 === colour2) {
            // it's a match!
            card1.setAttribute('matched', 'true');
            card2.setAttribute('matched', 'true');
            
            // make them slightly transparent to show they're matched
            card1.style.opacity = '0.6';
            card2.style.opacity = '0.6';

            this.matchedPairs++;
            this.#updateStats();

            // check if game is won
            if (this.matchedPairs === this.totalPairs) {
                this.#showWinMessage();
            }
        } else {
            // not a match, flip them back
            card1.flip();
            card2.flip();
        }

        // reset for next turn
        this.flippedCards = [];
        this.isChecking = false;
    }

    #updateStats() {
        const movesSpan = this.shadowRoot.querySelector('#moves');
        const pairsSpan = this.shadowRoot.querySelector('#pairs');
        
        if (movesSpan) {
            movesSpan.textContent = this.movesCount;
        }
        if (pairsSpan) {
            pairsSpan.textContent = this.matchedPairs;
        }
    }

    #showWinMessage() {
        const winDiv = this.shadowRoot.querySelector('#win-message');
        if (winDiv) {
            winDiv.textContent = `You won! Total moves: ${this.movesCount}`;
            winDiv.style.display = 'block';
        }
    }
}

customElements.define('memory-game', MemoryGame);
