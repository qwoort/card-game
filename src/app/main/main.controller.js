MainController.$inject = ['$timeout', '$interval', 'lodash'];

export function MainController($timeout, $interval, _){

  const SQUARE_SIDE = 5;
  const TIME_TO_REMEMBER_THE_PAIR = 1; //In seconds

  class Timer {
    constructor(){
      this.time = 0;
      this._timer = null;
    }

    start(){
      this.time = 0;
      this._timer = $interval(()=>{
        this.time++;
      }, 1000);
    }

    stop(){
      $interval.cancel(this._timer);
    }
  }

  class Card {
    constructor(id, name) {
      this.id = id;
      this.name = name;
      this.opened = false;
    }
  }

  let _cardRememberMode = false;
  let _temporaryOpenedCard = null;
  let _cards = (()=>{
    let pairsCount = ((SQUARE_SIDE*SQUARE_SIDE) - (SQUARE_SIDE*SQUARE_SIDE)%2)/2;
    let buffer = [];
    for (let i = 0; i < pairsCount; i++) {
      buffer.push(
        new Card(i * 2,     'card-'+i),
        new Card(i * 2 + 1, 'card-'+i)
      );
    }
    return buffer;
  })();

  function _createNewGameMatrix(_cards){
    return _(_cards)
      .shuffle()
      .chunk(SQUARE_SIDE)
      .value();
  }

  return new class {

    constructor() {
      this.stepsCount = 0;
      this.noOneGameStillWasNotWinned = true;
      this.waitingToPlay = true;
      this.timer = new Timer($interval);
      this.gameMatrix = _createNewGameMatrix(_cards);
    }

    startGame(){
      this.waitingToPlay = false;
      this.stepsCount = 0;
      this.timer.start();
      this.gameMatrix = _createNewGameMatrix(_cards);
    }

    openCard(clickedCard) {
      if (!clickedCard.opened && !_cardRememberMode) {
        clickedCard.opened = true;

        if (_temporaryOpenedCard === null) {
          _temporaryOpenedCard = clickedCard;

        } else {
          if (clickedCard.name !== _temporaryOpenedCard.name) {

            _cardRememberMode = true;

            $timeout(()=>{
              clickedCard.opened = false;
              _temporaryOpenedCard.opened = false;
              _cardRememberMode = false;
              _temporaryOpenedCard = null;
            }, TIME_TO_REMEMBER_THE_PAIR*1000)

          } else {
            _temporaryOpenedCard = null;

            if (_cards.every(
                  card => (card.opened === true)
              )){
              this.timer.stop();
              this.noOneGameStillWasNotWinned = false;
              this.waitingToPlay = true;
            }
          }

          this.stepsCount++;
        }
      }
    }
  }
}


