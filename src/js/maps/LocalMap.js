
import properties from '../properties';
import utils from '../util/utils';

import Cache from '../util/Cache';
import Window from '../ui/Window';

import localTileDictionary from './data/localTileDictionary.json';

export default class LocalMap extends Window {
  constructor(game, stealthSystem) {
    super(
      properties.width - properties.localWidth, 0,
      properties.localWidth, properties.localHeight,
      'Local Map', 0);

    this.game = game;
    this.stealthSystem = stealthSystem;

    this.playState = game.playState;

    this.cache = new Cache();

    this.map = game.playState.map;
    this.player = game.playState.player;
    this.enemies = game.playState.enemies;
  }

  getPaletteIndex() {
    if (this.playState.level >= 10) {
      return 2;
    }
    else if (this.playState.level >= 6) {
      return 1;
    }
    return 0;
  }

  tileIsGoal(x, y) {
    if (!(utils.keyFromXY(x, y) in this.map)) {
      return null;
    }
    return this.map[utils.keyFromXY(x, y)].name === 'Goal';
  }

  getTile(x, y) {
    if (!(utils.keyFromXY(x, y) in this.map)) {
      return null;
    }
    const name = this.map[utils.keyFromXY(x, y)].name;
    return localTileDictionary[name];
  }

  inEnemyFov(x, y) {
    return this.enemies
      .map(enemy => enemy.fov)
      .some(fov => fov.isVisible(x, y));
  }

  render(display) {

    const paletteIndex = this.getPaletteIndex();

    Object.values(this.map).forEach((tile) => {

      const tileDef = localTileDictionary[tile.name];

      const tileBrightness = this.inEnemyFov(tile.x, tile.y) ? 50 : 0;

      // Cache the adjusted colors for speediness
      const fgCacheKey = `${tileDef.fgColor[paletteIndex]}-${tileBrightness}`;
      const fgAdjusted = this.cache.get(
        fgCacheKey,
        () => utils
          .adjustBrightness(tileDef.fgColor[paletteIndex], tileBrightness));
      const bgCacheKey = `${tileDef.bgColor[paletteIndex]}-${tileBrightness}`;
      const bgAdjusted = this.cache.get(
        bgCacheKey,
        () => utils
          .adjustBrightness(tileDef.bgColor[paletteIndex], tileBrightness));

      display.draw(this.x + tile.x, this.y + tile.y, tileDef.glyph,
        fgAdjusted, bgAdjusted);
    });

    this.enemies.forEach(enemy => enemy.render(display, this, paletteIndex));

    this.player.render(display, this, paletteIndex);
  }

  inputHandler(input) {
    // Map handles many stateful inputs, so dispatch to the system
    this.stealthSystem.handleInput(input, this);

    // Trigger a redraw
    this.game.refresh();
  }
}
