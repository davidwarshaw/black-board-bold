import ROT from 'rot-js';

ROT.RNG.setSeed(200);
ROT.Display.Rect.cache = true;

export default {
  width: 126,
  height: 38,
  localWidth: 126,
  localHeight: 38,
  fontSize: 16,
  displaySpacing: 1.0,
  displayBorder: 0.0,
  rng: ROT.RNG,
  keyMap: {
    [ROT.VK_LEFT]: 'LEFT',
    [ROT.VK_RIGHT]: 'RIGHT',
    [ROT.VK_UP]: 'UP',
    [ROT.VK_DOWN]: 'DOWN',
    [ROT.VK_RETURN]: 'ENTER',
    [ROT.VK_Z]: 'WAIT'
  },
  searchTurns: 15,
  sleepTurns: 40,
  reverseTurnChance: 25,
  turnDownCorridorChance: 15,
  textAnimationMillis: 50,
  gameOverAnimationMillis: 30
};
