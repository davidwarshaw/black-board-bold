import properties from '../properties';
import utils from '../util/utils';
import TileMath from '../util/TileMath';

import mapProcedures from './mapProcedures';
import localTileDictionary from './data/localTileDictionary';

import AStar from './AStar';

function addMachineCluster(map, numberOfClusters) {
  Object.values(map)
    .filter(tile => {
      for (let y = tile.y; y < tile.y + 7; y++) {
        for (let x = tile.x; x < tile.x + 5; x++) {
          const neighbor = map[utils.keyFromXY(x, y)];
          if (neighbor && neighbor.name !== 'Floor') {
            return false;
          }
        }
      }
      return true;
    })
    .map(tile => {
      const order = properties.rng.getPercentage();
      return { tile, order};
    })
    .sort((l, r) => l.order - r.order)
    .slice(0, numberOfClusters)
    .forEach((candidate) => {
      const { tile } = candidate;
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 5; x++) {
          if ((y === 1 || y === 4) && (x === 1 || x === 3)) {
            const name = 'Machine-Top';
            map[utils.keyFromXY(x + tile.x, y + tile.y)] =
              { name, x: x + tile.x, y: y + tile.y };
          }
          else if ((y === 2 || y === 5) && (x === 1 || x === 3)) {
            const name = 'Machine-South';
            map[utils.keyFromXY(x + tile.x, y + tile.y)] =
              { name, x: x + tile.x, y: y + tile.y };
          }
        }
      }
    });
}

function addGoal(map, playerStart) {
  const candidates = Object.values(map)
    .filter(tile => localTileDictionary[tile.name].traversable)
    .filter(tile =>
      mapProcedures.neighborCount(map, tile.x, tile.y, 'Impassable') === 0)
    .map(tile => {
      const order = TileMath
        .distance(playerStart.x, playerStart.y, tile.x, tile.y);
      return { tile, order };
    })
    .sort((l, r) => r.order - l.order);

  const name = 'Goal';
  const { x, y } = candidates[0].tile;
  map[utils.keyFromXY(x, y)] = { name, x, y };
}

function addPlayerNiche(map) {
  const candidates = Object.values(map)
    .filter(tile => localTileDictionary[tile.name].traversable)
    .map(tile => {
      const order = TileMath.distance(0, 0, tile.x, tile.y);
      return { tile, order };
    })
    .sort((l, r) => l.order - r.order);

  const topLeft = {};
  topLeft.x = utils.clamp(
    candidates[0].tile.x, 0 + 5, properties.localWidth - 1);
  topLeft.y = utils.clamp(
    candidates[0].tile.y, 0, properties.localHeight - 1 - 4);

  for (let y = topLeft.y; y < topLeft.y + 4; y++) {
    for (let x = topLeft.x - 5; x < topLeft.x; x++) {
      if (x < topLeft.x - 2 || y === topLeft.y) {
        const name = 'Passable';
        map[utils.keyFromXY(x, y)] = { name, x, y };
      }
    }
  }

  return { x: topLeft.x - 4, y: topLeft.y + 2 };
}

function allConnected(map, nodes) {
  const astar = new AStar(map, null, null);
  let allConnected = true;
  nodes.forEach((from, i) => {
    nodes.forEach((to, j) => {
      if (i !== j) {
        const path = astar.findPath(from, to);
        if (path.length === 0) {
          allConnected = false;
        }
      }
    });
  });
  return allConnected;
}

function ensureConnectivity(map, nodes) {
  // Early exit
  if (allConnected(map, nodes)) {
    return;
  }

  const astar = new AStar(map, null, null);
  const connected = {};
  nodes.forEach((from, i) => {
    connected[i] = i;
    nodes.forEach((to, j) => {
      if (i !== j) {
        const path = astar.findPath(from, to);
        if (path.length > 0 && j < connected[i]) {
          connected[i] = j;
        }
      }
    });
  });

  // Dedupe
  const toConnect = Object.values(connected)
    .filter((e, i, self) => self.indexOf(e) === i);

  toConnect.forEach((from, i) => {
    toConnect.forEach((to, j) => {
      if (i !== j) {
        const connectingLine = TileMath.tileLine(
          nodes[from].x, nodes[from].y,
          nodes[to].x, nodes[to].y);
        for (let k = 0; k < Math.floor(connectingLine.length / 2); k++) {
          const left = connectingLine[
            Math.round(connectingLine.length / 2) + k];
          for (let q = -1; q < 2; q++) {
            const name = 'Passable';
            const { x, y } = left;
            map[utils.keyFromXY(x, y + q)] = { name, x, y: y + q };
          }

          const right = connectingLine[
            Math.round(connectingLine.length / 2) - k];
          for (let q = -1; q < 2; q++) {
            const name = 'Passable';
            const { x, y } = right;
            map[utils.keyFromXY(x, y + q)] = { name, x, y: y + q };
          }

          if (allConnected(map, nodes)) {
            return;
          }
        }
      }
    });
  });
}

function startingPositions(map, playerStart, radius) {
  return Object.values(map)
    .filter(tile =>
      localTileDictionary[tile.name].traversable)
    .filter(tile =>
      mapProcedures.neighborCount(map, tile.x, tile.y, 'Impassable') === 0)
    .filter(tile =>
      TileMath.distance(playerStart.x, playerStart.y, tile.x, tile.y) >= radius)
    .map(tile => {
      const order = properties.rng.getPercentage();
      return { tile, order};
    })
    .sort((l, r) => l.order - r.order);
}

function ninePatchString(map, x, y, name) {
  const patchArray = new Array(9);
  patchArray[4] = true;
  patchArray[3] = x > 0 ?
    map[utils.keyFromXY(x - 1, y)].name === name :
    false;
  patchArray[5] = x < properties.localWidth - 1 ?
    map[utils.keyFromXY(x + 1, y)].name === name :
    false;
  patchArray[1] = y > 0 ?
    map[utils.keyFromXY(x, y - 1)].name === name :
    false;
  patchArray[7] = y < properties.localHeight - 1 ?
    map[utils.keyFromXY(x, y + 1)].name === name :
    false;
  patchArray[0] = patchArray[1] && patchArray[3] ?
    map[utils.keyFromXY(x - 1, y - 1)].name === name :
    false;
  patchArray[2] = patchArray[1] && patchArray[5] ?
    map[utils.keyFromXY(x + 1, y - 1)].name === name :
    false;
  patchArray[6] = patchArray[7] && patchArray[3] ?
    map[utils.keyFromXY(x - 1, y + 1)].name === name :
    false;
  patchArray[8] = patchArray[7] && patchArray[5] ?
    map[utils.keyFromXY(x + 1, y + 1)].name === name :
    false;
  const patchBits = patchArray.map(patch => patch ? 1 : 0);
  return patchBits;
}

function postProcessMap(preMap) {

  // Remove single tile walls
  mapProcedures.tilesWithNeighbors(preMap, 'Impassable', 'Passable', 6)
    .forEach(tile => tile.name = 'Passable');
  mapProcedures.tilesWithNeighbors(preMap, 'Impassable', 'Passable', 6)
    .forEach(tile => tile.name = 'Passable');

  // First pass for heightening
  const firstMap = {};
  for (let y = 0; y < properties.localHeight; y++) {
    for (let x = 0; x < properties.localWidth; x++) {
      const tile = preMap[utils.keyFromXY(x, y)].name;
      const south = y < properties.localHeight - 1 ?
        preMap[utils.keyFromXY(x, y + 1)].name :
        null;
      let name = 'Wall-Top';
      if (tile === 'Passable') {
        name = 'Floor';
      }
      else if (tile === 'Impassable' && south === 'Passable') {
        name = 'Wall-South';
      }
      else if (tile === 'Goal') {
        name = 'Goal';
      }
      firstMap[utils.keyFromXY(x, y)] = { name, x, y };
    }
  }

  // Second pass for nine patch
  const secondMap = {};
  for (let y = 0; y < properties.localHeight; y++) {
    for (let x = 0; x < properties.localWidth; x++) {
      const tile = firstMap[utils.keyFromXY(x, y)].name;
      let name = tile;
      if (tile === 'Wall-Top') {
        const patchBits = ninePatchString(firstMap, x, y, 'Wall-Top');
        if (patchBits[3] && patchBits[5] &&
          (!patchBits[1] || !patchBits[7])) {
          name = 'Wall-Top-East-West';
        }
        else if (patchBits[1] && patchBits[7] &&
          (!patchBits[3] || !patchBits[5])) {
          name = 'Wall-Top-North-South';
        }
        const patchString = patchBits.join('');
        switch (patchString) {
          case '111111110':
            name = 'Wall-Top-North-West';
            break;
          case '111111011':
            name = 'Wall-Top-North-East';
            break;
          case '110111111':
            name = 'Wall-Top-South-West';
            break;
          case '011111111':
            name = 'Wall-Top-South-East';
            break;
          case '000011011':
            name = 'Wall-Top-North-West';
            break;
          case '000110110':
            name = 'Wall-Top-North-East';
            break;
          case '011011000':
            name = 'Wall-Top-South-West';
            break;
          case '110110000':
            name = 'Wall-Top-South-East';
            break;
        }
      }
      secondMap[utils.keyFromXY(x, y)] = { name, x, y };
    }
  }

  return secondMap;
}

function initializeMap() {
  const map = {};
  for (let y = 0; y < properties.localHeight; y++) {
    for (let x = 0; x < properties.localWidth; x++) {
      const name = 'Impassable';
      map[utils.keyFromXY(x, y)] = { name, x, y };
    }
  }
  return map;
}

function circle(existingMap, center, innerRadius, outerRadius) {
  for (let y = 0; y < properties.localHeight; y++) {
    for (let x = 0; x < properties.localWidth; x++) {
      const xRadius = Math.abs(x - center.x);
      const yRadius = Math.abs(y - center.y);

      if ((xRadius >= innerRadius && xRadius <= outerRadius &&
          yRadius <= outerRadius) ||
        (yRadius >= innerRadius && yRadius <= outerRadius &&
          xRadius <= outerRadius)) {
        const name = 'Passable';
        existingMap[utils.keyFromXY(x, y)] = { name, x, y };
      }
    }
  }

}

function circles(level) {
  const mapCenterX = Math.round(properties.localWidth / 2);
  const mapCenterY = Math.round(properties.localHeight / 2);

  const innerRadii = [...Array(level).keys()]
    .map(() => Math.round(3 + (level * properties.rng.getUniform())));
  const radius = level + (innerRadii.reduce((l, r) => l + r));
  const largestRadius = level + 2;

  let existingMap = initializeMap();

  const candidateCenters = Object.values(existingMap)
    .filter(tile =>
      tile.x > largestRadius + 4 &&
      tile.x < properties.localWidth - largestRadius - 4 &&
      tile.y > largestRadius + 4 &&
      tile.y < properties.localHeight - largestRadius - 4)
    .filter(tile =>
      TileMath.distance(mapCenterX, mapCenterY, tile.x, tile.y) <= radius)
    .map(tile => {
      const order = properties.rng.getPercentage();
      return { tile, order};
    })
    .sort((l, r) => l.order - r.order)
    .map(group => group.tile);

  const candidateNodes = [...Array(level).keys()].map((i) => {
    const outerRadius = innerRadii[i] + 2;
    circle(existingMap, candidateCenters[i], innerRadii[i], outerRadius);
    return {
      x: candidateCenters[i].x + innerRadii[i],
      y: candidateCenters[i].y
    };
  });

  ensureConnectivity(existingMap, candidateNodes);

  const playerStart = addPlayerNiche(existingMap);

  addGoal(existingMap, playerStart);


  const map = postProcessMap(existingMap);

  const numberOfClusters = Math.max(0, level - 4);
  addMachineCluster(map, numberOfClusters);

  return { map, playerStart };
}

function generateMap(level) {

  const map = circles(level);

  return map;
}

export default {
  startingPositions,
  generateMap
};
