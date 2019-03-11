import properties from '../properties';

import Window from './Window';

import text from './data/text';

export default class Codec extends Window {
  constructor(game, state, conversation) {
    super(0, 0, properties.localWidth, properties.localHeight);
    this.game = game;
    this.state = state;
    this.conversation = conversation;

    this.eqX = 46;
    this.eqY = 7;

    this.lineNumber = 0;
    this.charNumber = 0;
    this.intervalId = setInterval(
      () => this.renderTextFrame(this.eqX, this.eqY + 16),
      properties.textAnimationMillis);

    this.display = null;
  }

  renderEq(display, x, y) {
    let lightLevel = 0;
    if (this.charNumber < this.conversation[this.lineNumber].length) {
      lightLevel = 70 + (10 * properties.rng.getUniform());
    }
    const lines = text.codecEq.split('\n');
    lines.forEach((line, i) => {
      const chars = line.split('');
      chars.forEach((char, j) => {
        const charPercent = Math.round(100 * j / line.length);
        const lightFgColor = charPercent < lightLevel ?
          this.style.codecMid :
          this.style.codecDark;
        display.draw(x + j, y + i, '▇',
          lightFgColor, this.style.bgColor);
      });
    });
  }

  renderPortrait(display, x, y, portrait) {
    const lines = portrait.split('\n');
    lines.forEach((line, i) => {
      const chars = line.split('');
      chars.forEach((char, j) => {
        switch(char) {
          case '.':
            display.draw(x + j, y + i, ' ',
              this.style.codecDark, this.style.codecDark);
            break;
          default:
            display.draw(x + j, y + i, char,
              this.style.codecMid, this.style.codecDark);
            break;
        }
      });
    });
  }

  renderTextFrame() {
    if (!this.display) {
      return;
    }
    this.game.refresh();
    let textCol = this.eqX - 6;
    let textRow = this.eqY + 16;
    for (let i = 0; i < this.charNumber; i++) {
      const char = this.conversation[this.lineNumber].split('')[i];
      textCol++;
      if (char === ' ' && textCol > this.eqX + 28) {
        textCol = this.eqX - 6;
        textRow++;
      }
      this.display.draw(textCol, textRow, char,
        this.style.codecLight, this.style.bgColor);
    }
    this.charNumber++;
  }

  render(display) {
    if (!this.display) {
      this.display = display;
    }

    this.renderEq(display, this.eqX, this.eqY);

    const pointerY = this.eqY + 4;

    const leftPointerX = this.eqX - 4;
    const leftPointerFgColor = this.lineNumber % 2 === 0 ?
      this.style.codecLight :
      this.style.codecDark;
    display.drawText(leftPointerX, pointerY,
      `%c{${leftPointerFgColor}}%b{${this.style.bgColor}}ᐊ`);

    const rightPointerX = this.eqX + 34;
    const rightPointerFgColor = this.lineNumber % 2 === 0 ?
      this.style.codecDark :
      this.style.codecLight;
    display.drawText(rightPointerX, pointerY,
      `%c{${rightPointerFgColor}}%b{${this.style.bgColor}}ᐅ`);

    const portraitY = this.eqY - 2;

    const leftPortraitX = rightPointerX - 59;
    this.renderPortrait(display, leftPortraitX, portraitY,
      text.codecPortraitC);

    const rightPortraitX = rightPointerX + 4;
    this.renderPortrait(display, rightPortraitX, portraitY,
      text.codecPortraitS);
  }



  inputHandler(input) {
    switch (input) {
      case 'ENTER':
        this.lineNumber++;
        this.charNumber = 0;
        if (this.lineNumber >= this.conversation.length) {
          clearInterval(this.intervalId);
          this.state.nextState();
        }
        break;
    }
    this.game.refresh();
  }

}
