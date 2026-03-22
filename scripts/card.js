// card.js

class Card {
    constructor(suit, value, imgPath) {
        this.suit = suit;
        this.value = value;
        this.imgPath = imgPath;
    }

    render() {
        const cardImg= document.createElement("img");   
        cardImg.src = this.imgPath;
        cardImg.alt = `${this.value} of ${this.suit}`;
        cardImg.className = "card-img";
        return cardImg;
    }
}

export default Card;