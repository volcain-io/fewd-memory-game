class GameStats {
  /**
   * Create a game stats instance.
   */
  constructor() {
    this.moves = 0;
    this.lifes = 3;
    this.time = '00:00';
  }

  /**
   * Set moves value.
   * @param {number} moves - The move value to set.
   */
  setMoves(moves) {
    if (!moves || moves < 1) {
      this.moves = 0;
    } else {
      this.moves = moves;
    }
  }

  /**
   * Set the lifes value.
   * @param {number} lifes - The lifes value to set.
   */
  setLifes(lifes) {
    if (!lifes || lifes < 1 || lifes > 3) {
      this.lifes = 3;
    } else {
      this.lifes = lifes;
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
   * Get the lifes value.
   * @return {number} The lifes value.
   */
  getLifes() {
    return this.lifes;
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
   * Decrease lifes value by 1.
   */
  decreaseAndSetLifes() {
    const newValue = this.lifes - 1;
    this.setLifes(newValue);
    this.setStatistic('lifes');
  }

  /**
   * Get star rating by given lifes.
   * @return {object} Returns star rating. Default are 0 stars.
   */
  getStarRating() {
    const starRating = '<i class="fa fa-star fa-1x"></i>';
    const starORating = '<i class="fa fa-star-o fa-1x"></i>';
    let innerHTML = starRating;
    switch (gameStats.getLifes()) {
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
   * @param {...string} statisticList - A list of statistics to set. Possible values: 'moves', 'lifes', 'time'.
   */
  setStatistic(...statisticList) {
    if (statisticList) {
      statisticList.forEach(elem => {
        switch (elem) {
          case 'moves':
            htmlElements.getGameMoves().textContent = this.getMoves();
            break;
          case 'lifes':
            htmlElements.getGameLifes().innerHTML = this.getStarRating();
            break;
          case 'time':
            htmlElements.getElapsedTime().textContent = this.getTime();
            break;
        }
      });
    }
  }

  /**
   * Reset to default values and update the frontend.
   * @param {...string} statisticList - A list of statistics to set. Possible values: 'moves', 'lifes', 'time'.
   */
  reset(...statisticList) {
    this.setMoves(0);
    this.setLifes(3);
    this.setTime('00:00');
  }
}

class HTMLElements {
  constructor() {
    this.gameMoves = document.getElementById('gameMoves');
    this.gameLifes = document.getElementById('gameLifes');
    this.elapsedTime = document.getElementById('elapsedTime');
    this.grid = document.getElementById('grid');
    this.preventClicks = document.getElementById('preventClicks');
    this.modal = document.getElementById('modal');
    this.modalError = document.getElementById('modalError');
    this.result = document.getElementById('result');
    this.tplMsgGameOver = document.getElementById('msgGameOver');
    this.errorMessage = document.getElementById('errorMessage');
  }

  getGameMoves() {
    return this.gameMoves;
  }

  getGameLifes() {
    return this.gameLifes;
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

  getTplMsgGameOver() {
    return this.tplMsgGameOver;
  }

  getErrorMessage() {
    return this.errorMessage;
  }
}

const gameStats = new GameStats();
let htmlElements = null;
const iconFont = 'fa';
const cardItems = generateItems();
// used to track the selections
let selection = [];
let cards = shuffleCards(cardItems);
// used to determine if game is over
let countMatchingCards = 0;
// interval id
let timerId = null;
// used to set lifes
const MIN_MOVES_0 = cards.length + 8;
const MIN_MOVES_1 = cards.length + 1;
const MIN_MOVES_2 = cards.length / 2 + 1;

// create HTML layout
window.onload = makeGrid;

/**
 * Generate 6 items for the game,
 * but if the screen size is greater then 399 pixels, then generate 8 items.
 * @return {array} The new items
 */
function generateItems() {
  const cardItems = [
    `${iconFont} ${iconFont}-amazon ${iconFont}-4x`,
    `${iconFont} ${iconFont}-android ${iconFont}-4x`,
    `${iconFont} ${iconFont}-apple ${iconFont}-4x`,
    `${iconFont} ${iconFont}-google ${iconFont}-4x`,
    `${iconFont} ${iconFont}-facebook ${iconFont}-4x`,
    `${iconFont} ${iconFont}-github ${iconFont}-4x`,
  ];
  if (screen.width >= 400) {
    cardItems.push(`${iconFont} ${iconFont}-reddit ${iconFont}-4x`);
    cardItems.push(`${iconFont} ${iconFont}-twitter ${iconFont}-4x`);
  }

  return cardItems;
}

function makeGrid() {
  htmlElements = new HTMLElements();
  gameStats.setStatistic('moves', 'lifes', 'time');

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
        // decrease lifes if user makes to much moves (see MIN_MOVES_0, MIN_MOVES_1, MIN_MOVES_2)
        if (gameStats.getMoves() === MIN_MOVES_1 || gameStats.getMoves() === MIN_MOVES_2) {
          gameStats.decreaseAndSetLifes();
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
        } else {
          // reset elements after 1 second
          window.setTimeout(() => {
            resetCSS(firstElem, secondElem);
          }, 1000);
        }
        isGameOver();
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
 */
function newGame() {
  // Reset matches, clear selections, set moves to 0, decrease game lifes, reset timer
  countMatchingCards = 0;
  clear(selection);
  gameStats.reset('moves', 'lifes', 'time');
  gameStats.setStatistic('moves', 'lifes', 'time');

  // Remove all css classes, remove event listeners ('click')
  elemCards = document.querySelectorAll('.card');
  removeEventListeners(elemCards);
  resetCSS(elemCards);

  // using timeout to set a small delay and prevent flipping cards before modal window closes
  window.setTimeout(() => {
    cards = shuffleCards(cardItems);
    placeIcons(cards);
    elemCards.forEach(elemCard => (elemCard.onclick = doClick));
    hideSuccess();
    hideError();
    startTimer();
  }, 250);
}

/**
 * Check if game is over. If user finished the game display a modal window.
 */
function isGameOver() {
  // count of matching cards must be equal to the number of cards
  if (countMatchingCards === cards.length) {
    stopTimer();
    showSuccess();
  }

  if (gameStats.getMoves() === MIN_MOVES_0) {
    stopTimer();
    showError('lifes');
  }
}

/**
 * Hide modal window.
 */
function hideSuccess() {
  htmlElements.getResult().textContent = '';
  htmlElements.getModal().classList.remove('visible', 'animate-fadeIn');
}

/**
 * Display success modal window.
 */
function showSuccess() {
  let [minutes, seconds] = gameStats.getTime().split(':');
  const sTime = minutes === '00' ? `${seconds} seconds` : `${gameStats.getTime()} minutes`;
  htmlElements.getResult().textContent = `${gameStats.getMoves()} moves in ${sTime}`;
  htmlElements.getModal().classList.add('visible', 'animate-fadeIn');
}

/**
 * Hide error modal window.
 */
function hideError() {
  htmlElements.getModalError().classList.remove('visible', 'animate-fadeIn');
}

/**
 * Display error modal window.
 */
function showError(type = 'time') {
  htmlElements.getErrorMessage().textContent = htmlElements
    .getTplMsgGameOver()
    .content.textContent.trim()
    .replaceAll('{tpl::type}', type);
  htmlElements.getModalError().classList.add('visible', 'animate-fadeIn');
}

/**
 * Shuffle cards array.
 * @param {array} arr - The array to shuffle
 * @return {array} The new shuffled array
 */
function shuffleCards(arr) {
  // if (arr && arr.length > 6 && screen.width < 400) arr = arr.slice(0, 6);
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

/**
 * Starts the timer and displays the elapsed time on the page.
 * The timer will stop after 03:00 minutes and display a 'game over' message.
 */
function startTimer() {
  stopTimer();
  timerId = window.setInterval(() => {
    let time = gameStats.getTime();
    let [sMinutes, sSeconds] = time.split(':');

    // parse to number
    let minutes = parseInt(sMinutes);
    let seconds = parseInt(sSeconds);
    seconds = seconds < 59 ? seconds + 1 : 0;
    if (seconds === 0) {
      minutes = minutes < 59 ? minutes + 1 : 0;
    }
    sSeconds = seconds < 10 ? `0${seconds}` : seconds;
    sMinutes = minutes < 10 ? `0${minutes}` : minutes;

    gameStats.setTime(`${sMinutes}:${sSeconds}`);
    gameStats.setStatistic('time');

    if (minutes >= 3 && seconds >= 00) {
      stopTimer();
      showError();
    }
  }, 1000);
}

/**
 * Cancel timer.
 */
function stopTimer() {
  if (timerId) {
    window.clearInterval(timerId);
  }
}
