import {ShapeCard} from './shapecard.js';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from './firebase-config.js';

// memory card game component
export class MemoryGame extends HTMLElement {
    static observedAttributes = ["size"];

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.movesCount = 0;
        this.isChecking = false;
    }

    connectedCallback() {
        const sizeAttr = this.getAttribute('size');

        // parse size - should be like '3 x 4'
        const parts = sizeAttr.split('x');
        const rows = parseInt(parts[0].trim());
        const cols = parseInt(parts[1].trim());

        const totalCards = rows * cols;
        this.totalPairs = totalCards / 2;

        this.setupGame(rows, cols);
    }

    setupGame(rows, cols) {
        // container
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '20px';
        container.style.padding = '20px';

        // title
        const heading = document.createElement('h1');
        heading.textContent = 'Memory Card Game';
        container.appendChild(heading);

        // stats
        const stats = document.createElement('div');
        stats.id = 'stats';
        stats.innerHTML = `<p>Moves: <span id="moves">0</span> | Pairs Found: <span id="pairs">0</span>/${this.totalPairs}</p>`;
        container.appendChild(stats);

        // button to show average
        const avgButton = document.createElement('button');
        avgButton.textContent = 'Show Average Clicks';
        avgButton.style.padding = '10px 20px';
        avgButton.style.fontSize = '16px';
        avgButton.style.cursor = 'pointer';
        avgButton.addEventListener('click', () => this.showAverageClicks());
        container.appendChild(avgButton);

        // div to display the average
        const avgDisplay = document.createElement('div');
        avgDisplay.id = 'average-display';
        avgDisplay.style.marginTop = '10px';
        avgDisplay.style.fontSize = '18px';
        avgDisplay.style.fontWeight = 'bold';
        container.appendChild(avgDisplay);

        // create the board
        const board = document.createElement('div');
        board.id = 'game-board';
        board.style.display = 'grid';
        board.style.gridTemplateColumns = `repeat(${cols}, 100px)`;
        board.style.gridTemplateRows = `repeat(${rows}, 100px)`;
        board.style.gap = '10px';

        // get cards
        const cardsHTML = ShapeCard.getUniqueRandomCardsAsHTML(this.totalPairs, true);
        board.innerHTML = cardsHTML;

        container.appendChild(board);

        // for the win message
        const winMsg = document.createElement('div');
        winMsg.id = 'win-message';
        winMsg.style.display = 'none';
        winMsg.style.fontSize = '24px';
        winMsg.style.color = 'green';
        winMsg.style.fontWeight = 'bold';
        winMsg.style.marginTop = '20px';
        container.appendChild(winMsg);

        // play again button
        const playAgainBtn = document.createElement('button');
        playAgainBtn.id = 'play-again-btn';
        playAgainBtn.textContent = 'Play Again';
        playAgainBtn.style.display = 'none';
        playAgainBtn.style.marginTop = '10px';
        playAgainBtn.style.padding = '10px 20px';
        playAgainBtn.style.fontSize = '16px';
        playAgainBtn.style.cursor = 'pointer';
        playAgainBtn.style.backgroundColor = '#4CAF50';
        playAgainBtn.style.color = 'white';
        playAgainBtn.style.border = 'none';
        playAgainBtn.style.borderRadius = '4px';
        playAgainBtn.addEventListener('click', () => this.resetGame());
        container.appendChild(playAgainBtn);

        this.shadowRoot.appendChild(container);

        // setup click handlers
        const cards = this.shadowRoot.querySelectorAll('shape-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => this.handleCardClick(e));
        });
    }

    handleCardClick(event) {
        const clickedCard = event.target;

        // don't let them click while we're checking
        if (this.isChecking) {
            return;
        }

        // already matched cards shouldn't be clickable
        if (clickedCard.hasAttribute('matched')) {
            return;
        }

        // can't click same card twice
        if (this.flippedCards.includes(clickedCard)) {
            return;
        }

        // flip it
        if (!clickedCard.isFaceUp()) {
            clickedCard.flip();
            this.flippedCards.push(clickedCard);
        }

        // if we have 2 cards flipped, check them
        if (this.flippedCards.length === 2) {
            this.movesCount++;
            this.updateStats();
            this.isChecking = true;

            // wait a bit so player can see both cards
            setTimeout(() => {
                this.checkMatch();
            }, 1000);
        }
    }

    checkMatch() {
        const card1 = this.flippedCards[0];
        const card2 = this.flippedCards[1];

        const type1 = card1.getAttribute('type');
        const colour1 = card1.getAttribute('colour');
        const type2 = card2.getAttribute('type');
        const colour2 = card2.getAttribute('colour');

        // do they match?
        if (type1 === type2 && colour1 === colour2) {
            // match!
            card1.setAttribute('matched', 'true');
            card2.setAttribute('matched', 'true');
            
            // make them look different when matched
            card1.style.opacity = '0.6';
            card2.style.opacity = '0.6';

            this.matchedPairs++;
            this.updateStats();

            // did we win?
            if (this.matchedPairs === this.totalPairs) {
                this.showWinMessage();
            }
        } else {
            // no match - flip back
            card1.flip();
            card2.flip();
        }

        // reset
        this.flippedCards = [];
        this.isChecking = false;
    }

    updateStats() {
        const movesSpan = this.shadowRoot.querySelector('#moves');
        const pairsSpan = this.shadowRoot.querySelector('#pairs');
        
        movesSpan.textContent = this.movesCount;
        pairsSpan.textContent = this.matchedPairs;
    }

    showWinMessage() {
        const winDiv = this.shadowRoot.querySelector('#win-message');
        const playAgainBtn = this.shadowRoot.querySelector('#play-again-btn');
        winDiv.textContent = `You won! Total moves: ${this.movesCount}`;
        winDiv.style.display = 'block';
        playAgainBtn.style.display = 'block';

        // save result to firestore
        this.saveGameResult();
    }

    async saveGameResult() {
        try {
            // create a new document in the 'gameResults' collection
            const docRef = await addDoc(collection(db, 'gameResults'), {
                clicks: this.movesCount,
                timestamp: serverTimestamp()
            });

            console.log('Game saved with ID:', docRef.id);
        } catch (error) {
            console.error('Error saving game:', error);
        }
    }

    async showAverageClicks() {
        const avgDiv = this.shadowRoot.querySelector('#average-display');
        avgDiv.textContent = 'Loading...';

        try {
            // get all documents from gameResults collection
            const querySnapshot = await getDocs(collection(db, 'gameResults'));

            if (querySnapshot.empty) {
                avgDiv.textContent = 'No games played yet!';
                return;
            }

            // add up all the clicks
            let totalClicks = 0;
            let gameCount = 0;

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                totalClicks += data.clicks;
                gameCount++;
            });

            // calculate average
            const average = totalClicks / gameCount;

            avgDiv.textContent = `Average clicks: ${average.toFixed(2)} (from ${gameCount} games)`;
        } catch (error) {
            console.error('Error getting average:', error);
            avgDiv.textContent = 'Error loading average';
        }
    }

    resetGame() {
        // reset game state
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.movesCount = 0;
        this.isChecking = false;

        // hide win message and button
        const winDiv = this.shadowRoot.querySelector('#win-message');
        const playAgainBtn = this.shadowRoot.querySelector('#play-again-btn');
        winDiv.style.display = 'none';
        playAgainBtn.style.display = 'none';

        // reset stats display
        const movesSpan = this.shadowRoot.querySelector('#moves');
        const pairsSpan = this.shadowRoot.querySelector('#pairs');
        movesSpan.textContent = '0';
        pairsSpan.textContent = '0';

        // reset all cards
        const cards = this.shadowRoot.querySelectorAll('shape-card');
        cards.forEach(card => {
            card.removeAttribute('flipped');
            card.removeAttribute('matched');
        });

        // shuffle and regenerate if needed
        this.shuffleCards();
    }
}

customElements.define('memory-game', MemoryGame);