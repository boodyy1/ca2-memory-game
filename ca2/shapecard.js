export class ShapeCard extends HTMLElement {
    static observedAttributes = ["type", "colour"];

    // Constructor - this gets called when we make a new card
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        // Get the template and add it to our shadow root
        this.shadowRoot.appendChild(document.getElementById('shape-card-template').content.cloneNode(true));

        // Set up the shape and colour based on attributes
        this.setShape(null, this.getAttribute('type'));
        this.setColour(this.getAttribute('colour'));

        // Set CSS variables for the card size
        this.style.setProperty("--card-width", '100px');
        this.style.setProperty("--card-height", '100px');
        this.style.setProperty("--card-border", '1px');
    }

    // This gets called whenever an attribute changes
    attributeChangedCallback(name, oldVal, newVal) {
        if (this.shadowRoot) {
            if (name == 'type') {
                this.setShape(oldVal, newVal);
            } else if (name == 'colour') {
                this.setColour(newVal);
            }
        }
    }

    // Change the shape that's displayed
    setShape(oldVal, newVal) {
        // Hide the old shape
        if (oldVal) {
            let oldShapeTag = this.getShapeTag(oldVal);
            let oldShape = this.shadowRoot.querySelector(oldShapeTag);
            if (oldShape) {
                oldShape.setAttribute('fill-opacity', '0');
            }
        }
        // Show the new shape
        if (newVal) {
            let newShapeTag = this.getShapeTag(newVal);
            let newShape = this.shadowRoot.querySelector(newShapeTag);
            if (newShape) {
                newShape.setAttribute('fill-opacity', '1');
            }
        }
    }

    // Helper function to get the SVG tag for each shape type
    getShapeTag(type) {
        if (type === 'circle') {
            return 'circle';
        } else if (type === 'square') {
            return 'rect';
        } else if (type === 'triangle') {
            return 'polygon';
        }
    }

    // Change the colour of the shape
    setColour(newVal) {
        if (newVal) {
            let shapeTag = this.getShapeTag(this.getAttribute("type"));
            let shape = this.shadowRoot.querySelector(shapeTag);
            if (shape) {
                shape.setAttribute('fill', newVal);
            }
        }
    }

    // Check if the card is showing the front side
    isFaceUp() {
        const card = this.shadowRoot.querySelector('.card');
        return card.classList.contains('card-face-up');
    }

    // Flip the card over
    flip() {
        const card = this.shadowRoot.querySelector('.card');
        card.classList.toggle('card-face-down');
        card.classList.toggle('card-face-up');
    }

    // Static method to generate random cards
    static getUniqueRandomCardsAsHTML(count, duplicate) {
        // All possible shapes
        let shapes = ['circle', 'square', 'triangle'];
        // All possible colours
        let colours = ['red', 'green', 'blue', 'yellow', 'orange', 'purple'];
        
        // Make all possible combinations
        let allCombinations = [];
        for (let i = 0; i < shapes.length; i++) {
            for (let j = 0; j < colours.length; j++) {
                allCombinations.push([shapes[i], colours[j]]);
            }
        }

        // Check if we have enough combinations
        if (count > allCombinations.length) {
            console.log("Error: not enough unique combinations!");
            return '';
        }

        // Shuffle the combinations array
        let shuffled = [];
        let tempArray = [];
        // Copy the array
        for (let i = 0; i < allCombinations.length; i++) {
            tempArray.push(allCombinations[i]);
        }
        // Pick random items
        while (tempArray.length > 0) {
            let randomIndex = Math.floor(Math.random() * tempArray.length);
            shuffled.push(tempArray[randomIndex]);
            tempArray.splice(randomIndex, 1);
        }

        // Take only the number we need
        let selected = [];
        for (let i = 0; i < count; i++) {
            selected.push(shuffled[i]);
        }

        // If we need duplicates, add each card twice
        let cards = [];
        if (duplicate) {
            for (let i = 0; i < selected.length; i++) {
                cards.push(selected[i]);
                cards.push(selected[i]); // add it twice
            }
        } else {
            cards = selected;
        }

        // Shuffle the final card array
        let finalCards = [];
        while (cards.length > 0) {
            let randomIndex = Math.floor(Math.random() * cards.length);
            finalCards.push(cards[randomIndex]);
            cards.splice(randomIndex, 1);
        }

        // Build the HTML string
        let html = '';
        for (let i = 0; i < finalCards.length; i++) {
            let card = finalCards[i];
            let type = card[0];
            let colour = card[1];
            html += `<shape-card type="${type}" colour="${colour}"></shape-card>`;
        }

        return html;
    }
}

// Register the custom element
customElements.define('shape-card', ShapeCard);