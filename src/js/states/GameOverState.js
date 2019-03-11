import State from './State';
import MenuState from './MenuState';
import InterstitialState from './InterstitialState';
import StealthState from './StealthState';

import GameOver from '../ui/GameOver';

export default class GameOverState extends State {
  constructor(game) {
    super(game);

    this.gameOver = new GameOver(game, this);
    this.windowManager.addWindow(this.gameOver);
  }


  menu() {
    this.game.switchState(new MenuState(this.game));
  }

  retry() {
    const text = `Level ${this.game.playState.level}`;
    const stealthState = new StealthState(this.game);
    this.game.switchState(
      new InterstitialState(this.game, text, stealthState));
  }

}
