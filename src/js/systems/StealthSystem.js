import properties from '../properties';
import utils from '../util/utils';

export default class StealthSystem {
  constructor(game, state) {
    this.game = game;
    this.state = state;

    this.playState = game.playState;
    this.player = game.playState.player;
    this.enemies = game.playState.enemies;

    // The action messages
    this.messages = [];

    // Targeting
    //
    // We're either in attack mode or move mode
    this.targetMode = false;

    // Keep track of whether we've started to move and now can't stop
    this.characterIsMoving = false;

    // Default target the center of the screen
    this.defaultTarget = {
      x: Math.round(properties.localWidth / 2),
      y: Math.round(properties.localHeight / 2)
    };
    this.target = {
      enemy: null,
      x: this.defaultTarget.x,
      y: this.defaultTarget.y,
      line: []
    };

    // The projectile
    //
    this.projectile = {
      intervalId: null,
      active: false,
      target: {
        x: null,
        y: null
      },
      intendedLine: [],
      actualLines: [],
      fireSequence: [],
      fireSequenceIndex: 0,
      glyphOctants: ['-', '\\', '|', '/', '-', '\\', '|', '/'],
      glyph: '-',
      fgColor: '#FFFFFF',
      muzzleGlyph: '*',
      muzzleFgColor: '#FFAE19'
    };

    // Character movement
    this.movement = {
      intervalId: null,
      line: [],
      index: 0
    };
  }

  enemyTurns(local) {
    this.enemies.forEach(enemy => {
      const action = enemy.takeTurn(local, this.player, this.enemies);
      switch (action.type) {
        case 'Move': {
          // Check if an enemy has caught the player
          if (this.enemyMoveToPlayer(action.x, action.y)) {
            this.capturedByEnemy();
          }

          // Check if the move is legal
          if (this.shouldMove(local, action.x, action.y)) {
            enemy.x = action.x;
            enemy.y = action.y;
          }
        }
          break;
        case 'Wait':
          // Do nothing
          break;
      }
      if (enemy.isActive()) {
        enemy.recalculateFov();
      }
    });
  }

  handleInput(input, local) {
    // Don't accept input while a projectile is in flight
    if (this.projectile.active) {
      return;
    }
    switch (input) {
      case 'LEFT':
        if (this.targetMode) {
          this.target.x =
            utils.clamp(this.target.x - 1, 0, local.width - 1);
          this.setTarget();
        }
        else {
          const { x, y } = this.player;
          const nextX = x - 1;
          const nextY = y;
          this.movePlayer(local, nextX, nextY);
        }
        break;
      case 'RIGHT':
        if (this.targetMode) {
          this.target.x =
            utils.clamp(this.target.x + 1, 0, local.width - 1);
          this.setTarget();
        }
        else {
          const { x, y } = this.player;
          const nextX = x + 1;
          const nextY = y;
          this.movePlayer(local, nextX, nextY);
        }
        break;
      case 'UP':
        if (this.targetMode) {
          this.target.y =
            utils.clamp(this.target.y - 1, 0, local.height - 1);
          this.setTarget();
        }
        else {
          const { x, y } = this.player;
          const nextX = x;
          const nextY = y - 1;
          this.movePlayer(local, nextX, nextY);
        }

        break;
      case 'DOWN':
        if (this.targetMode) {
          this.target.y =
            utils.clamp(this.target.y + 1, 0, local.height - 1);
          this.setTarget();
        }
        else {
          const { x, y } = this.player;
          const nextX = x;
          const nextY = y + 1;
          this.movePlayer(local, nextX, nextY);
        }
        break;
      case 'WAIT':
        break;
    }

    // Enemies take their turns
    this.enemyTurns(local);

    this.game.playState.totalTurns++;
  }

  movePlayer(local, nextX, nextY) {
    if (this.playerMoveToGoal(local, nextX, nextY)) {
      this.reachGoal();
    }
    const attackedEnemy = this.moveIsAttack(local, nextX, nextY);
    if (attackedEnemy && attackedEnemy.isActive() &&
      !attackedEnemy.fov.isVisible(this.player.x, this.player.y)) {
      attackedEnemy.attack(local, this.player);
    }
    if (this.shouldMove(local, nextX, nextY)) {
      this.player.x = nextX;
      this.player.y = nextY;
    }
  }

  playerMoveToGoal(local, x, y) {
    return local.tileIsGoal(x, y);
  }

  enemyMoveToPlayer(x, y) {
    return this.player.x === x && this.player.y === y;
  }

  moveIsAttack(local, nextX, nextY) {
    const attackedEnemies = this.enemies.filter(
      enemy => enemy.x === nextX && enemy.y === nextY);
    return attackedEnemies[0];
  }

  shouldMove(local, nextX, nextY) {
    // Don't allow a move off the map
    const inMap = (nextX >= 0) && (nextX < local.width) &&
      (nextY >= 0) && (nextY < local.height);
    if (!inMap) {
      return false;
    }

    // Dont allow a move into a non-traversable tile
    const tile = local.getTile(nextX, nextY);

    return tile.traversable;
  }

  reachGoal() {
    if (this.playState.level < 12) {
      this.state.nextLevel();
    }
    else {
      this.state.gameComplete();
    }
  }

  capturedByEnemy() {
    this.state.gameOver();
  }
}
