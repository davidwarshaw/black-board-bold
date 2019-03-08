import utils from '../util/utils';

import TileMath from '../util/TileMath';

import localTileDictionary from '../maps/data/localTileDictionary.json';


function getArc(x, y, facing) {
  const coneAngle = (45 * Math.PI) / 180;
  const angle = Math.atan2(facing.y, facing.x);
  const left = TileMath.edgeTileFromAngle(x, y, angle + coneAngle);
  const right = TileMath.edgeTileFromAngle(x, y, angle - coneAngle);
  return TileMath.tileLine(left.x, left.y, right.x, right.y);
}

export default class Fov {
  constructor(map, distance) {
    this.map = map;
    this.distance = distance;

    this.field = {};
  }

  clear() {
    this.field = {};
  }

  isVisible(x, y) {
    return this.field[utils.keyFromXY(x, y)];
  }

  recalculate(x, y, facing) {
    this.field = {};
    const arc = getArc(x, y, facing);
    arc
      .map(point => TileMath.tileLine(x, y, point.x, point.y))
      .filter(ray => ray.length > 0)
      .forEach((ray) => {
        let i = 0;
        let visible = true;
        while (visible && i < ray.length) {
          const { x, y } = ray[i];
          const tile = this.map[utils.keyFromXY(x, y)];
          const tileDef = localTileDictionary[tile.name];

          if (tileDef.concealment === 100) {
            visible = false;
          }
          else {
            this.field[utils.keyFromXY(x, y)] = true;
          }
          i++;
        }
      });
  }
}
