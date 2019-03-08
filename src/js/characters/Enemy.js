import properties from '../properties';

import TileMath from '../util/TileMath';

import mapProcedures from '../maps/mapProcedures';

import Character from './Character';
import Fov from './Fov';
import AStar from '../maps/AStar';

export default class Enemy extends Character {
  constructor(game, id, map, start, turnClockwise, moveThisTurn) {
    super(game, start);

    this.id = id;
    this.map = map;

    this.moveThisTurn = moveThisTurn;
    this.turnClockwise = turnClockwise;

    if (moveThisTurn && turnClockwise) {
      this.facing = { x: -1, y: 0 };
    }
    else if (!moveThisTurn && turnClockwise) {
      this.facing = { x: 1, y: 0 };
    }
    else if (moveThisTurn && !turnClockwise) {
      this.facing = { x: 0, y: -1 };
    }
    else {
      this.facing = { x: 0, y: 1 };
    }

    this.fovDistance = 10;
    this.fov = new Fov(map, this.fovDistance);

    // Patrol, Alert, Pursue, Search, Sleep
    this.mode = 'Patrol';

    this.targetPosition = null;
    this.targetPath = null;
    this.searchTimer = null;
    this.sleepTimer = null;

    this.glyph = 'g';
    this.deadGlyph = '6';

    this.fgColor = '#FFFFFF';
    this.bgColor = null;

    this.alertBadgeGlyph = '!';
    this.alertFgColor = '#FF0000';

    this.searchBadgeGlyph = '?';
    this.searchFgColor = '#FF0000';

    this.sleepGlyph = '6';
    this.sleepBadgeGlyph = 'z';
    this.sleepFgColor = '#FFFFFF';

    this.recalculateFov();
  }

  isActive() {
    return this.mode !== 'Sleep';
  }

  recalculateFov() {
    this.fov.recalculate(this.x, this.y, this.facing);
  }

  render(display, map, paletteIndex) {
    const tile = map.getTile(this.x, this.y);
    const glyph = this.mode === 'Sleep' ? this.sleepGlyph : this.glyph;

    display.draw(this.x, this.y, glyph,
      this.fgColor, tile.bgColor[paletteIndex]);

    if ((this.mode === 'Alert' || this.mode === 'Pursue' ||
      this.mode === 'Wake') && this.y > 0) {
      display.draw(this.x, this.y - 1, this.alertBadgeGlyph,
        this.alertFgColor, tile.bgColor[paletteIndex]);
    }
    else if (this.mode === 'Search' && this.y > 0) {
      display.draw(this.x, this.y - 1, this.searchBadgeGlyph,
        this.searchFgColor, tile.bgColor[paletteIndex]);
    }
    else if (this.mode === 'Sleep' && this.y > 0) {
      display.draw(this.x, this.y - 1, this.sleepBadgeGlyph,
        this.sleepFgColor, tile.bgColor[paletteIndex]);
    }
  }

  facingFromPoint(x, y) {
    this.facing = { x: x - this.x, y: y - this.y };
  }

  facingFromAngle(angle) {
    this.facing = {
      x: Math.round(Math.cos(angle)),
      y: Math.round(Math.sin(angle))
    };
  }

  angleFromFacing() {
    return Math.atan2(this.facing.y, this.facing.x);
  }

  rotateFacing(angle) {
    const currentAngle = this.angleFromFacing();
    this.facingFromAngle(currentAngle + angle);
  }

  rotateFacingByTurnClockwise(reverseDirection) {
    const reverse = reverseDirection ? -1 : 1;
    const sign = this.turnClockwise ? 1 * reverse : -1 * reverse;
    const currentAngle = this.angleFromFacing();
    this.facingFromAngle(currentAngle + (sign * (Math.PI / 2)));
  }

  resetFacing() {
    const currentAngle = this.angleFromFacing();
    const roundedAngle = Math
      .round(currentAngle / (Math.PI / 2)) * (Math.PI / 2);
    this.facingFromAngle(roundedAngle);
  }

  moveInSameDirection(action) {
    this.resetFacing();
    action.type = 'Move';
    action.x = this.x + this.facing.x;
    action.y = this.y + this.facing.y;
  }

  moveInNewDirection(action, x, y) {
    action.type = 'Move';
    action.x = x;
    action.y = y;
  }

  moveInSameDirectionHalfSpeed(action) {
    if (this.moveThisTurn) {
      this.moveInSameDirection(action);
    }
    else {
      action.type = 'Wait';
    }
    this.moveThisTurn = !this.moveThisTurn;
  }

  targetPlayerAStar(local, player, enemies) {
    this.targetPosition = { x: player.x, y: player.y };
    const astar = new AStar(local.map, player, enemies);
    const path = astar.findPath(
      { x: this.x, y: this.y }, this.targetPosition);
    if (path && path.length > 0) {
      this.targetPath = path;
      return true;
    }
  }

  targetPlayerLine(local, player) {
    const path = TileMath.tileLine(this.x, this.y, player.x, player.y);
    if (path && path.length > 1) {
      this.targetPath = path.slice(1);
      return true;
    }
  }

  targetCharacterLine(local, target) {
    const path = TileMath.tileLine(this.x, this.y, target.x, target.y);
    if (path && path.length > 1) {
      this.targetPath = path.slice(1);
      return true;
    }
  }

  clearTarget() {
    this.targetPosition = null;
    this.targetPath = null;
  }

  corridorAtAngle(local, angle) {
    const rotated = TileMath.rotateVector(this.facing, angle);
    const corridorX = this.x + (4 * rotated.x);
    const corridorY = this.y + (4 * rotated.y);

    const corridorTile = local.getTile(corridorX, corridorY);
    const corridorTraversable = corridorTile && corridorTile.traversable;

    const neighborsAreFloor = mapProcedures
      .neighborCount(local.map, corridorX, corridorY, 'Floor') === 8;

    return corridorTraversable & neighborsAreFloor;
  }

  closestSleepingEnemy(enemies) {
    const sleepingEnemies = enemies
      .filter(enemy => enemy.id !== this.id)
      .filter(enemy => this.fov.isVisible(enemy.x, enemy.y))
      .filter(enemy => enemy.mode === 'Sleep')
      .map((enemy) => {
        const distance = TileMath.distance(this.x, this.y, enemy.x, enemy.y);
        return { enemy, distance };
      })
      .sort((l, r) => l.distance - r.distance);
    const closest = sleepingEnemies.length > 0 ?
      sleepingEnemies[0].enemy :
      null;
    return closest;
  }

  takeTurn(local, player, enemies) {
    const action = {};

    const playerSpotted = this.fov.isVisible(player.x, player.y);
    const sleepingEnemySpotted = this.closestSleepingEnemy(enemies);

    // Determine action form AI mode
    switch(this.mode) {
      case 'Patrol': {

        const tileAheadTraversable = local.getTile(
          this.x + (2 * this.facing.x),
          this.y + (2 * this.facing.y)).traversable;

        const corridorLeft = this.corridorAtAngle(local, -1 * (Math.PI / 2));
        const corridorRight = this.corridorAtAngle(local, Math.PI / 2);

        if (playerSpotted) {
          this.mode = 'Alert';

          this.moveInSameDirectionHalfSpeed(action);

          this.game.playState.alerts++;
        }
        else if (sleepingEnemySpotted) {
          this.mode = 'Wake';
          this.targetCharacterLine(local, sleepingEnemySpotted);
          this.facingFromPoint(player.x, player.y);

          const { x, y } = this.targetPath.shift();
          this.moveInNewDirection(action, x, y);
        }
        else if (corridorLeft) {

          if (properties.rng.getPercentage() <=
            properties.turnDownCorridorChance) {
            this.rotateFacing(-Math.PI / 2);
          }

          this.moveInSameDirectionHalfSpeed(action);
        }
        else if (corridorRight) {
          if (properties.rng.getPercentage() <=
            properties.turnDownCorridorChance) {
            this.rotateFacing(Math.PI / 2);
          }

          this.moveInSameDirectionHalfSpeed(action);
        }
        else if (tileAheadTraversable) {
          this.moveInSameDirectionHalfSpeed(action);
        }
        else {
          action.type = 'Wait';
          this.moveThisTurn = !this.moveThisTurn;

          if (properties.rng.getPercentage() <= properties.reverseTurnChance) {
            this.rotateFacingByTurnClockwise(true);
          }
          else {
            this.rotateFacingByTurnClockwise();
          }
        }
      }
        break;
      case 'Alert': {

        this.targetPlayerAStar(local, player, enemies);
        this.facingFromPoint(player.x, player.y);

        if (this.targetPath) {

          this.mode = 'Pursue';

          const { x, y } = this.targetPath.shift();
          this.moveInNewDirection(action, x, y);
        }
        else {
          this.mode = 'Patrol';

          action.type = 'Wait';
        }
      }
        break;
      case 'Pursue': {

        if (playerSpotted) {
          this.targetPlayerLine(local, player, enemies);
          this.facingFromPoint(player.x, player.y);

          const { x, y } = this.targetPath.shift();
          this.moveInNewDirection(action, x, y);
        }
        else if (this.targetPath && this.targetPath.length > 0) {
          this.facingFromPoint(player.x, player.y);

          const { x, y } = this.targetPath.shift();
          this.moveInNewDirection(action, x, y);
        }
        else {
          this.clearTarget();
          this.resetFacing();

          this.mode = 'Search';
          this.searchTimer = properties.searchTurns;

          action.type = 'Wait';
        }
      }
        break;

      case 'Search': {

        const tileAheadTraversable = local.getTile(
          this.x + (2 * this.facing.x),
          this.y + (2 * this.facing.y)).traversable;

        if (playerSpotted) {
          this.mode = 'Pursue';

          this.targetPlayerLine(local, player, enemies);
          this.facingFromPoint(player.x, player.y);

          const { x, y } = this.targetPath.shift();
          this.moveInNewDirection(action, x, y);
        }
        else if (this.searchTimer > 0 && tileAheadTraversable) {
          this.searchTimer--;

          this.moveInSameDirection(action);
        }
        else if (this.searchTimer > 0) {
          this.searchTimer--;
          action.type = 'Wait';

          this.rotateFacingByTurnClockwise();
        }
        else {
          this.mode = 'Patrol';

          this.moveInSameDirection(action);

          this.game.playState.escapes++;
        }
      }
        break;
      case 'Sleep':
        this.clearTarget();
        this.resetFacing();

        action.type = 'Wait';

        this.sleepTimer--;
        if (this.sleepTimer <= 0) {
          this.clearTarget();
          this.resetFacing();
          this.mode = 'Search';
          this.searchTimer = properties.searchTurns;

          this.game.playState.guardsWokeUp++;
        }
        break;
      case 'Wake':
        if (playerSpotted) {
          this.mode = 'Alert';

          this.moveInSameDirectionHalfSpeed(action);
        }
        else if (sleepingEnemySpotted) {
          this.targetCharacterLine(local, sleepingEnemySpotted);
          this.facingFromPoint(player.x, player.y);

          if (this.targetPath.length <= 1) {
            this.clearTarget();
            this.resetFacing();
            this.mode = 'Search';
            this.searchTimer = properties.searchTurns;

            sleepingEnemySpotted.mode = 'Search';
            sleepingEnemySpotted.searchTimer = properties.searchTurns;

            this.game.playState.guardsWokeUp++;
          }
          else {
            const { x, y } = this.targetPath.shift();
            this.moveInNewDirection(action, x, y);
          }
        }
        else {
          this.clearTarget();
          this.resetFacing();
          this.mode = 'Search';
          this.searchTimer = properties.searchTurns;

          this.game.playState.guardsWokeUp++;
        }
        break;
    }

    return action;
  }

  attack(local, player) {
    this.x = player.x;
    this.y = player.y;
    this.mode = 'Sleep';
    this.sleepTimer = properties.sleepTurns;
    this.fov.clear();

    this.game.playState.guardsKnockedOut++;
  }
}
