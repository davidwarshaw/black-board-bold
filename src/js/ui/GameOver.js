import properties from '../properties';
import utils from '../util/utils';

import Window from './Window';

import text from './data/text';

export default class Codec extends Window {
  constructor(game, state) {
    super(0, 0, properties.localWidth, properties.localHeight);
    this.game = game;
    this.state = state;

    this.pointerToRetry = true;

    this.gameOverX = 10;
    this.gameOverY = 6;

    this.colNumber = 0;
    this.intervalId = setInterval(
      () => this.renderTextFrame(this.gameOverX, this.gameOverY),
      properties.gameOverAnimationMillis);

    this.display = null;
  }

  renderTextFrame() {
    if (!this.display) {
      return;
    }
    this.game.refresh();
    const lines = text.gameOverLogo.split('\n');
    const maxLine = lines
      .map(line => line.length)
      .sort((l, r) => r - l)
      .slice(0)[0];
    const lineSpark1 = Math.floor(lines.length * properties.rng.getUniform());
    const lineSpark2 = utils.clamp(lineSpark1 + 1, 0, lines.length - 1);
    lines.forEach((line, i) => {
      const chars = line.split('');
      for (let j = 0; j < this.colNumber; j++) {
        let bgColor;
        bgColor = i === lineSpark1 && j === this.colNumber - 1 &&
          this.colNumber < maxLine - 1 ?
          this.style.sparkBlueLight :
          this.style.bgColor;
        bgColor = i === lineSpark2 && j === this.colNumber - 1 &&
          this.colNumber < maxLine - 1 ?
          this.style.sparkBlueMid :
          this.style.bgColor;
        const char = chars[j];
        switch(char) {
          case '-':
          case '_':
            this.display.draw(this.gameOverX + j, this.gameOverY + i, chars[j],
              this.style.codecMid, bgColor);
            break;
          default:
            this.display.draw(this.gameOverX + j, this.gameOverY + i, chars[j],
              this.style.codecLight, bgColor);
            break;
        }
      }
      const lineLeft = maxLine - this.colNumber;
      const lineStart = this.colNumber +
        Math.floor(lineLeft * properties.rng.getUniform());
      const lineStop = Math.min(maxLine, lineStart + 5);
      for (let j = this.colNumber; j < maxLine; j++) {
        if (j >= lineStart && j <= lineStop) {
          this.display.draw(this.gameOverX + j, this.gameOverY + lineSpark1,
            '-', this.style.codecLight, this.style.bgColor);
          this.display.draw(this.gameOverX + j, this.gameOverY + lineSpark2,
            '_', this.style.codecLight, this.style.bgColor);
        }
      }
    });

    if (this.colNumber < maxLine - 1) {
      const diagonallLength = Math.round(20 * properties.rng.getUniform());
      for (let j = 0; j < diagonallLength; j++) {
        const col = this.colNumber - j + diagonallLength;
        const row = this.gameOverY + lineSpark1 + j;
        this.display.draw(col, row, '/',
          this.style.codecLight, this.style.bgColor);
      }
      for (let j = 0; j < Math.round(diagonallLength / 2); j++) {
        const col = this.colNumber - j + diagonallLength;
        const row = this.gameOverY - lineSpark1 - j;
        this.display.draw(col, row, '\\',
          this.style.codecLight, this.style.bgColor);
      }
    }

    this.colNumber++;
    if (this.colNumber > maxLine) {
      clearInterval(this.intervalId);
    }
  }

  render(display) {
    if (!this.display) {
      this.display = display;
    }
    const menuX = 57;
    const menuY = 28;
    display.drawText(menuX, menuY,
      `%c{${this.style.titleColor}}%b{${this.style.bgColor}}Retry Level`);
    display.drawText(menuX, menuY + 2,
      `%c{${this.style.titleColor}}%b{${this.style.bgColor}}Return to Menu`);

    const pointerX = 55;
    const pointerY = this.pointerToRetry ? menuY : menuY + 2;
    display.drawText(pointerX, pointerY,
      `%c{${this.style.titleColor}}%b{${this.style.bgColor}}ᐅ`);
  }

  inputHandler(input) {
    switch (input) {
      case 'UP':
      case 'DOWN':
        this.pointerToRetry = !this.pointerToRetry;
        break;
      case 'ENTER':
        if (this.pointerToRetry) {
          clearInterval(this.intervalId);
          this.state.retry();
        }
        else {
          clearInterval(this.intervalId);
          this.state.menu();
        }
        break;
    }
    this.game.refresh();
  }

}
