class GameStats {
  /**
   * Create a game stats instance.
   */
  constructor() {
    this.moves = 0;
    this.level = 3;
    this.time = '00:00';
  }

  /**
   * Set moves value.
   * @param {number} moves - The move value to set.
   */
  setMoves(moves) {
    if (!moves || (moves && moves < 1)) {
      this.moves = 0;
    } else {
      this.moves = moves;
    }
  }

  /**
   * Set the level value.
   * @param {number} level - The level value to set.
   */
  setLevel(level) {
    if (!level || (level && (level < 1 || level > 3))) {
      this.level = 3;
    } else {
      this.level = level;
    }
  }

  /**
   * Set the time value.
   * @param {string} time - The time value to set.
   */
  setTime(time) {
    this.time = time;
  }

  /**
   * Get the moves value. One move equals two flipped cards.
   * @return {number} The moves value.
   */
  getMoves() {
    return this.moves;
  }

  /**
   * Get the level value.
   * @return {number} The level value.
   */
  getLevel() {
    return this.level;
  }

  /**
   * Get the time value (MM:SS).
   * @return {string} The string representing the time value.
   */
  getTime() {
    return this.time;
  }

  /**
   * Increase moves value by 1.
   */
  increaseAndSetMoves() {
    const newValue = this.moves + 1;
    this.setMoves(newValue);
    this.setStatistic('moves');
  }

  /**
   * Decrease level value by 1.
   */
  decreaseAndSetLevel() {
    const newValue = this.level - 1;
    this.setLevel(newValue);
    this.setStatistic('level');
  }

  /**
   * Get star rating by given level.
   * @return {object} Returns star rating. Default are 0 stars.
   */
  getStarRating() {
    const starRating = '<i class="fa fa-star fa-1x"></i>';
    const starORating = '<i class="fa fa-star-o fa-1x"></i>';
    let innerHTML = starRating;
    switch (gameStats.getLevel()) {
      case 1:
        innerHTML += starORating + starORating;
        break;
      case 2:
        innerHTML += starRating + starORating;
        break;
      default:
        innerHTML += starRating + starRating;
        break;
    }
    return innerHTML;
  }

  /**
   * Set statistics.
   * @param {...string} statisticList - A list of statistics to set. Possible values: 'moves', 'level', 'time'.
   */
  setStatistic(...statisticList) {
    if (statisticList) {
      statisticList.forEach(elem => {
        switch (elem) {
          case 'moves':
            // select element and set value
            htmlElements.getGameMoves().textContent = this.getMoves();
            break;
          case 'level':
            // select element and set value
            htmlElements.getGameLevel().innerHTML = this.getStarRating();
            break;
          case 'time':
            // select element and set value
            htmlElements.getElapsedTime().textContent = this.getTime();
            break;
        }
      });
    }
  }

  /**
   * Reset to default values and update the frontend.
   * @param {...string} statisticList - A list of statistics to set. Possible values: 'moves', 'level', 'time'.
   */
  reset(...statisticList) {
    this.setMoves(0);
    this.setLevel(3);
    this.setTime('00:00');
  }
}

class HTMLElements {
  constructor() {
    this.gameMoves = document.getElementById('gameMoves');
    this.gameLevel = document.getElementById('gameLevel');
    this.elapsedTime = document.getElementById('elapsedTime');
    this.grid = document.getElementById('grid');
    this.preventClicks = document.getElementById('preventClicks');
    this.modal = document.getElementById('modal');
    this.modalError = document.getElementById('modalError');
    this.result = document.getElementById('result');
  }

  getGameMoves() {
    return this.gameMoves;
  }

  getGameLevel() {
    return this.gameLevel;
  }

  getElapsedTime() {
    return this.elapsedTime;
  }

  getGrid() {
    return this.grid;
  }

  getPreventClicks() {
    return this.preventClicks;
  }

  getModal() {
    return this.modal;
  }

  getModalError() {
    return this.modalError;
  }

  getResult() {
    return this.result;
  }
}

const gameStats = new GameStats();
let htmlElements = null;
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
// shuffle cards
let cards = shuffleCards(cardItems);
// used to determine if game is over
let countMatchingCards = 0;
// interval id
let timerId = null;
// used to set level
const MIN_LEVEL_1 = cards.length * 2 + 1; // 33
const MIN_LEVEL_2 = cards.length + 1; // 17

// create HTML layout
window.onload = makeGrid;

function makeGrid() {
  // select elements
  htmlElements = new HTMLElements();
  // set statistics
  gameStats.setStatistic('moves', 'level', 'time');

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
    htmlElements.getGrid().appendChild(front);
  });
  // select all HTML card elements
  let elemCards = document.querySelectorAll('.card');
  // add event listener to each item
  elemCards.forEach(elemCard => (elemCard.onclick = doClick));
  // start timer
  startTimer();
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
      // main part of the game
      if (selection && selection.length === 2) {
        // set moves
        gameStats.increaseAndSetMoves();
        // decrease level if user makes to much moves (see MIN_LEVEL_1, MIN_LEVEL_2)
        if (gameStats.getMoves() === MIN_LEVEL_1 || gameStats.getMoves() === MIN_LEVEL_2) {
          gameStats.decreaseAndSetLevel();
        }
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
 * 1. Clear selections, reset statistics
 * 2. Remove all css classes, remove event listeners ('click')
 * 3. Shuffle cards, place icons, add event listeners ('click')
 * @param {boolean} isRestart - Flag, to indicate a restart.
 */
function newGame(isRestart = true) {
  // Reset matches, clear selections, set moves to 0, decrease game level, reset timer
  countMatchingCards = 0;
  clear(selection);
  gameStats.reset('moves', 'level', 'time');
  gameStats.setStatistic('moves', 'level', 'time');

  // Remove all css classes, remove event listeners ('click')
  elemCards = document.querySelectorAll('.card');
  removeEventListeners(elemCards);
  resetCSS(elemCards);

  // using timeout to set a small delay and prevent flipping cards before modal window closes
  window.setTimeout(() => {
    // Shuffle cards, place icons, add event listeners ('click')
    cards = shuffleCards(cardItems);
    placeIcons(cards);
    elemCards.forEach(elemCard => (elemCard.onclick = doClick));
    // clear message
    htmlElements.getResult().textContent = '';
    // disable modal window
    htmlElements.getModal().classList.remove('visible', 'animate-fadeIn');
    // disable modal error window
    htmlElements.getModalError().classList.remove('visible', 'animate-fadeIn');
    // starting the timer
    startTimer();
  }, 250);
}

/**
 * Check if game is over. If user finished the game display a modal window.
 */
function isGameOver() {
  // count of matching cards must be equal to the number of cards
  if (countMatchingCards === cards.length) {
    // stop timer
    stopTimer();

    let sTime = `${gameStats.getTime()} minutes`;
    let [minutes, seconds] = sTime.split(':');
    if (minutes === '00') sTime = `${seconds} seconds`;
    // get element to display message
    htmlElements.getResult().textContent = `${gameStats.getMoves()} moves at Level ${gameStats.getLevel()} in ${sTime}`;
    // show modal window
    htmlElements.getModal().classList.add('visible', 'animate-fadeIn');
  }
}

function runOutOfTime() {
  // stop timer
  stopTimer();
  // show modal window
  htmlElements.getModalError().classList.add('visible', 'animate-fadeIn');
}

/**
 * Shuffle cards array.
 * @param {array} arr - The array to shuffle
 * @return {array} The new shuffled array
 */
function shuffleCards(arr) {
  if (arr && arr.length > 6 && screen.width < 400) arr = arr.slice(0, 6);
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
  htmlElements.getPreventClicks().classList.toggle('visible');
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

function startTimer() {
  // stop timer if any
  stopTimer();
  // start new timer
  timerId = window.setInterval(() => {
    let time = gameStats.getTime();
    let [minutes, seconds] = time.split(':');

    // parse to number
    minutes = parseInt(minutes);
    seconds = parseInt(seconds);
    // set seconds
    seconds = seconds < 59 ? seconds + 1 : 0;
    if (seconds === 0) {
      // set minutes
      minutes = minutes < 59 ? minutes + 1 : 0;
    }
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    minutes = minutes < 10 ? `0${minutes}` : minutes;

    gameStats.setTime(`${minutes}:${seconds}`);
    gameStats.setStatistic('time');

    if (minutes === 59 && seconds === 59) {
      runOutOfTime();
    }
  }, 1000);
}

function stopTimer() {
  if (timerId) {
    window.clearInterval(timerId);
  }
}
