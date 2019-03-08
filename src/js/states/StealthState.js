import properties from '../properties';
import State from './State';
import CodecState from './CodecState';

import InterstitialState from '../states/InterstitialState';

import Character from '../characters/Character';
import Enemy from '../characters/Enemy';
import mapGeneration from '../maps/mapGeneration';

import StealthSystem from '../systems/StealthSystem';

import LocalMap from '../maps/LocalMap';

import text from '../ui/data/text';

export default class StealthState extends State {
  constructor(game) {
    super(game);

    game.playState = this.addLevelState(game.playState);

    this.stealthSystem = new StealthSystem(game, this);

    this.localMap = new LocalMap(game, this.stealthSystem);
    this.windowManager.addWindow(this.localMap);
  }

  addLevelState(playState) {
    const radius = 4;
    const { level } = playState;
    const { map, playerStart } = mapGeneration.generateMap(level);
    const enemyStarts = mapGeneration
      .startingPositions(map, playerStart, radius);

    const player = new Character(this.game, playerStart);
    const enemies = [...Array(level).keys()].map((i) => {
      const turnClockwise = properties.rng.getPercentage() <= 50;
      const moveThisTurn = properties.rng.getPercentage() <= 50;
      return new Enemy(
        this.game, i, map, enemyStarts[i].tile, turnClockwise, moveThisTurn);
    });

    return Object.assign({}, playState, { map, player, enemies });
  }

  nextLevel() {
    this.game.playState.level++;

    const text = `Level ${this.game.playState.level}`;
    const stealthState = new StealthState(this.game);
    this.game.switchState(
      new InterstitialState(this.game, text, stealthState));
  }

  gameOver() {
    this.game.playState.captures++;

    const text = `Level ${this.game.playState.level}`;
    const stealthState = new StealthState(this.game);
    this.game.switchState(
      new InterstitialState(this.game, text, stealthState));
  }

  gameComplete() {
    this.game.switchState(new CodecState(this.game, text.winConversation));
  }
}
