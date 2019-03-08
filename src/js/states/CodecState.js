import State from './State';
import MenuState from './MenuState';
import InterstitialState from './InterstitialState';

import Codec from '../ui/Codec';

export default class CodecState extends State {
  constructor(game, conversation, toMenu) {
    super(game);

    this.toMenu = toMenu;

    this.menu = new Codec(game, this, conversation);
    this.windowManager.addWindow(this.menu);
  }


  nextState() {
    if (this.toMenu) {
      this.game.switchState(new MenuState(this.game));
    }
    else {
      const text = `
      BLACK BOARD BOLD
      ================


      MISSION DEBRIEF
      ---------------


      Guards alerted: ${this.game.playState.alerts}

      S was captured: ${this.game.playState.captures}

      S escaped: ${this.game.playState.escapes}

      Guards knocked out: ${this.game.playState.guardsKnockedOut}

      Guards woke up after being knocked out: ${this.game.playState.guardsWokeUp}

      Total turns elapsed: ${this.game.playState.totalTurns}
      `;
      this.game.switchState(
        new InterstitialState(this.game, text, new MenuState(this.game)));
    }
  }

}
