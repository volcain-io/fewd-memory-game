// icon font
const iconFont = 'fa';
// declare card items
const cardItems = [
  `${iconFont} ${iconFont}-amazon ${iconFont}-4x`,
  `${iconFont} ${iconFont}-android ${iconFont}-4x`,
  `${iconFont} ${iconFont}-apple ${iconFont}-4x`,
  `${iconFont} ${iconFont}-google ${iconFont}-4x`,
  `${iconFont} ${iconFont}-facebook ${iconFont}-4x`,
  `${iconFont} ${iconFont}-github ${iconFont}-4x`,
  `${iconFont} ${iconFont}-reddit ${iconFont}-4x`,
  `${iconFont} ${iconFont}-twitter ${iconFont}-4x`,
];
// used to track the selections
let selection = [];
// used to count the number of moves the user needed to complete the game
let moves = 0;
// used to display game level
// with each game restart the level will be decreased
let level = 3;
// shuffle cards
let cards = shuffleCards(cardItems);
// used to determine if game is over
let countMatchingCards = 0;

// create HTML layout
window.onload = makeGrid;

function makeGrid() {
  // set moves
  setMoves();
  // set level
  setLevel(level);
  // select grid
  const grid = document.getElementById('grid');

  // add cards to grid
  cards.forEach((item, idx) => {
    const dataId = idx + 1;
    // card front
    const front = document.createElement('div');
    front.className = 'card pointer';
    front.setAttribute('data-id', dataId);
    // card back
    const back = document.createElement('div');
    back.className = 'back';
    // card icon
    const icon = document.createElement('span');
    icon.className = cards[idx];

    back.appendChild(icon);
    front.appendChild(back);
    grid.appendChild(front);
  });
  // select all HTML card elements
  let elemCards = document.querySelectorAll('.card');
  // add event listener to each item
  elemCards.forEach(elemCard => (elemCard.onclick = doClick));
}

/**
 * All game logic is covered in this function and will be fired on each click event.
 * We do check for a match and set the corresponding animations.
 * @param {object} event - The event object (onclick)
 */
function doClick(event) {
  if (event && event.target) {
    const card = event.target.className === 'back' ? event.target.parentElement : event.target;
    if (card) {
      // add to selection
      markCard(card);
      // flip the card
      flipCard(card);
      // set moves
      setMoves();
      // main part of the game
      if (selection && selection.length === 2) {
        // get selected elements
        const [firstIdx, secondIdx] = selection;
        const firstElem = document.querySelector(`div[data-id="${firstIdx + 1}"]`);
        const secondElem = document.querySelector(`div[data-id="${secondIdx + 1}"]`);
        // enable layer to prevent further events
        toggleLayer();
        // check if we have a match
        const isMatch = cards[firstIdx] === cards[secondIdx];
        if (isMatch) {
          // remove event listeners from the elements
          removeEventListeners(firstElem, secondElem);
          // count matching cards (2 cards == 1 match)
          countMatchingCards += 2;
          // check if game is over
          isGameOver();
        } else {
          // reset elements after 1 second
          window.setTimeout(() => {
            resetCSS(firstElem, secondElem);
          }, 1000);
        }
        // set css class ('success')
        doMatch(isMatch, firstElem, secondElem);
        // hide overlay to allow events
        window.setTimeout(toggleLayer, 1000);
        // clear selection
        clear(selection);
      }
    }
  }
}

/**
 * Start new game. Behaviour is like follows:
 * 1. Clear selections, set moves to zero, decrease game level
 * 2. Remove all css classes, remove event listeners ('click') 
 * 3. Shuffle cards, place icons, add event listeners ('click')
 * @param {boolean} isRestart - Flag, to indicate a restart.
 */
function newGame(isRestart = true) {
  // Reset matches, clear selections, set moves to 0, decrease game level
  moves = 0;
  level = isRestart ? level - 1 : 3;
  countMatchingCards = 0;
  clear(selection);
  setMoves();
  setLevel(level);

  // Remove all css classes, remove event listeners ('click')
  elemCards = document.querySelectorAll('.card');
  removeEventListeners(elemCards);
  resetCSS(elemCards);
  const modal = document.getElementById('modal');
  modal.classList.remove('visible', 'animate-fadeIn');

  // using timeout to set the icons are flipping the cards
  window.setTimeout(() => {
    // Shuffle cards, place icons, add event listeners ('click')
    cards = shuffleCards(cardItems);
    placeIcons(cards);
    elemCards.forEach(elemCard => (elemCard.onclick = doClick));
  }, 500);
}

/**
 * Check if game is over. If user finished the game display a modal window.
 */
function isGameOver() {
  // count of matching cards must be equal to the number of cards
  if (countMatchingCards === cards.length) {
    // get modal window
    const modal = document.getElementById('modal');
    // get element to display message
    const result = document.getElementById('result');
    // set message
    result.textContent = `You needed ${getMoves()} moves at Level ${level}`;
    // show modal window
    modal.classList.add('visible', 'animate-fadeIn');
  }
}

/**
 * Shuffle cards array.
 * @param {array} arr - The array to shuffle
 * @return {array} The new shuffled array
 */
function shuffleCards(arr) {
  // double size given array since we always need two icons of one card
  const newArr = [...arr, ...arr];
  let tmpValue = null;
  let currentIdx = newArr.length;
  let randomIdx = null;

  while (currentIdx > 0) {
    randomIdx = Math.floor(Math.random() * currentIdx);
    currentIdx -= 1;

    tmpValue = newArr[currentIdx];
    newArr[currentIdx] = newArr[randomIdx];
    newArr[randomIdx] = tmpValue;
  }

  return newArr;
}

/**
 * Set class name of the corresponding font icon for each card item.
 * @param {array} arr - The array of card items
 */
function placeIcons(arr) {
  // loop through each array with forEach (since it's fastest method)
  arr.forEach((item, idx) => {
    const dataId = idx + 1;
    // select element and set css class
    const elem = document.querySelector(`div[data-id="${dataId}"] div[class="back"] span`);
    if (elem) {
      elem.className = arr[idx];
    }
  });
}

/**
 * Add the card the user selected to the selection.
 * @param {object} card - The card to mark.
 */
function markCard(card) {
  if (card) {
    const id = card.getAttribute('data-id');
    if (id && selection && selection.indexOf(id - 1) === -1) {
      selection.push(id - 1);
      moves += 1;
    }
  }
}

/**
 * Add the css class to animate flipping of the selected card.
 * @param {object} card - The card to be flipped.
 */
function flipCard(card) {
  // get list of classes from the current card element
  const { classList } = card.className === 'back' ? card.parentElement : card;

  if (!classList.contains('flipped')) {
    classList.add('flipped');
  }
}

/**
 * Set the color of the card in case of a match.
 * @param {boolean} isMatch - The flag to indicate a match.
 * @param {...object} elementList - List of elements to set the color of.
 */
function doMatch(isMatch, ...elementList) {
  if (elementList) {
    const class_1 = isMatch ? 'success' : 'error';
    const class_2 = `animate-${class_1}`;
    elementList.forEach(elem => {
      if (elem.classList) {
        elem.classList.add(class_1, class_2);
      }
    });
  }
}

/**
 * Toggle the overlay to allow/prevent click events.
 */
function toggleLayer() {
  const preventClicks = document.getElementById('preventClicks');
  if (preventClicks) {
    preventClicks.classList.toggle('visible');
  }
}

/**
 * Set game moves. One move equals two flipped cards.
 */
function setMoves() {
  // select element and set value
  const gameMoves = document.getElementById('gameMoves');
  if (gameMoves) {
    gameMoves.textContent = getMoves();
  }
}

function getMoves() {
  if (!moves || (moves && moves < 0)) {
    moves = 0;
    return moves;
  }
  return Math.floor(moves / 2);
}
/**
 * Set game level.
 * @param {number} level - The number to set. If false || < 1, set 1.
 */
function setLevel(level) {
  if (!level || (level && level < 1)) {
    level = 1;
  }
  // select element and set value
  const gameLevel = document.getElementById('gameLevel');
  if (gameLevel) {
    gameLevel.textContent = level;
  }
}

/**
 * Remove event listeners ('click').
 * @param {...object} elementList - List of elements to set remove the event listeners from.
 */
function removeEventListeners(...elementList) {
  if (elementList) {
    elementList.forEach(elem => {
      if (elem instanceof NodeList) {
        elem.forEach(item => {
          item.removeEventListener('click', doClick);
        });
      } else {
        elem.removeEventListener('click', doClick);
      }
    });
  }
}

/**
 * Remove following css classes: 'flipped', 'success', 'error', 'animate-success', 'animate-error'.
 * @param {...object} elementList - List of elements to remove the css classes from.
 */
function resetCSS(...elementList) {
  if (elementList) {
    elementList.forEach(elem => {
      if (elem instanceof NodeList) {
        elem.forEach(item => {
          item.classList.remove('flipped', 'success', 'error', 'animate-success', 'animate-error');
        });
      } else {
        elem.classList.remove('flipped', 'success', 'error', 'animate-success', 'animate-error');
      }
    });
  }
}

/**
 * Remove all items from the given array.
 * @param {array} arr - The array to clear.
 */
function clear(arr) {
  while (arr && arr.length > 0) {
    arr.pop();
  }
}
