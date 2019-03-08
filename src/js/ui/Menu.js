import properties from '../properties';

import Window from './Window';

import text from './data/text';

export default class Menu extends Window {
  constructor(game, state) {
    super(0, 0, properties.localWidth, properties.localHeight);
    this.game = game;
    this.state = state;

    this.pointerToPlay = true;
  }

  renderLogo(display, x, y) {
    const lines = text.mainLogo.split('\n');
    lines.forEach((line, i) => {
      const chars = line.split('');
      chars.forEach((char, j) => {
        switch(char) {
          case '#': {
            display.draw(x + j, y + i, ' ',
              this.style.textColor, this.style.textColor);
          }
            break;
          case '|':
          case '/': {
            display.draw(x + j, y + i, ' ',
              this.style.fieldBgColor, this.style.fieldBgColor);
          }
            break;
          default: {
            display.draw(x + j, y + i, char,
              this.style.textColor, this.style.bgColor);
          }
            break;
        }
      });
    });
  }

  render(display) {
    const topTitleX = 40;
    const topTitleY = 6;
    const topTitleText =
      `%c{${this.style.textColor}}%b{${this.style.bgColor}}${text.topTitle}`;
    display.drawText(topTitleX, topTitleY, topTitleText);

    const logoX = 6;
    const logoY = 8;
    this.renderLogo(display, logoX, logoY);

    const subTitleX = 24;
    const subTitleY = 20;
    const subTitleText =
      `%c{${this.style.bgColor}}%b{${this.style.textColor}}${text.subTitle}`;
    display.drawText(subTitleX, subTitleY, subTitleText);

    const menuX = 60;
    const menuY = 28;
    display.drawText(menuX, menuY,
      `%c{${this.style.titleColor}}%b{${this.style.bgColor}}Play`);
    display.drawText(menuX, menuY + 2,
      `%c{${this.style.titleColor}}%b{${this.style.bgColor}}Intro`);

    const pointerX = 58;
    const pointerY = this.pointerToPlay ? menuY : menuY + 2;
    display.drawText(pointerX, pointerY,
      `%c{${this.style.titleColor}}%b{${this.style.bgColor}}ᐅ`);
  }

  inputHandler(input) {
    switch (input) {
      case 'UP':
      case 'DOWN':
        this.pointerToPlay = !this.pointerToPlay;
        break;
      case 'ENTER':
        if (this.pointerToPlay) {
          this.state.play();
        }
        else {
          this.state.help();
        }
        break;
    }
    this.game.refresh();
  }

}
