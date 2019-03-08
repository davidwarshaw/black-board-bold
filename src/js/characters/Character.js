export default class Character {
  constructor(game, start) {
    this.game = game;
    
    this.x = start.x;
    this.y = start.y;

    this.alive = true;

    this.prone = false;

    this.glyph = 'S';
    this.deadGlyph = '%';

    this.fgColor = '#FFFFFF';
    this.bgColor = null;
  }

  render(display, map, paletteIndex) {
    const tile = map.getTile(this.x, this.y);
    const glyph = this.alive ? this.glyph : this.deadGlyph;
    display.draw(this.x, this.y, glyph,
      this.fgColor, tile.bgColor[paletteIndex]);
  }
}
