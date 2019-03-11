import State from './State';
import StealthState from './StealthState';
import CodecState from './CodecState';
import InterstitialState from './InterstitialState';

import Menu from '../ui/Menu';

import playState from '../playState';

import text from '../ui/data/text';

export default class MenuState extends State {
  constructor(game) {
    super(game);

    this.game.playState = playState.createPlayState();

    this.menu = new Menu(game, this);
    this.windowManager.addWindow(this.menu);
  }


  play() {
    const text = `Level ${this.game.playState.level}`;
    const levelOneState =
       new InterstitialState(this.game, text, new StealthState(this.game));
    this.game.switchState(levelOneState);
  }

  help() {
    const helpState = new CodecState(this.game, text.helpConversation, true);
    this.game.switchState(helpState);
  }

}
