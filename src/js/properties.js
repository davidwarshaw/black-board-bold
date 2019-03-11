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
    [ROT.VK_Z]: 'WAIT',
    [ROT.VK_A]: 'ATTACK',
    [ROT.VK_S]: 'NEXT TARGET',
    [ROT.VK_P]: 'PRONE',
    [ROT.VK_E]: 'ENTER/EXIT',
    [ROT.VK_I]: 'INVENTORY',
    [ROT.VK_T]: 'TAKE',
    [ROT.VK_1]: 'NUM_1',
    [ROT.VK_2]: 'NUM_2',
    [ROT.VK_3]: 'NUM_3',
    [ROT.VK_4]: 'NUM_4',
    [ROT.VK_5]: 'NUM_5',
    [ROT.VK_6]: 'NUM_6',
    [ROT.VK_7]: 'NUM_7',
    [ROT.VK_8]: 'NUM_8'
  },

  searchTurns: 15,
  sleepTurns: 40,
  reverseTurnChance: 25,
  turnDownCorridorChance: 15,
  textAnimationMillis: 50,
  gameOverAnimationMillis: 30
};
