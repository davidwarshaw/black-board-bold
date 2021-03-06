import properties from '../properties';
import utils from './utils';

function rotateVector(vector, angle) {
  const rotated = {
    x: Math.round((vector.x * Math.cos(angle)) - (vector.y * Math.sin(angle))),
    y: Math.round((vector.x * Math.sin(angle)) + (vector.y * Math.cos(angle)))
  };
  return rotated;
}

function octantOfLine(linePoints) {
  const angle = angleOfLine(linePoints);
  const fraction = angle / (Math.PI * 2);
  const octant = utils.clamp(Math.round((fraction * 8) - 0.5), 0, 7);

  // console.log(`angle: ${angle}, fraction: ${fraction}, octant: ${octant}`);
  return octant;
}

function angleOfLine(linePoints) {
  const dx = linePoints[linePoints.length - 1].x - linePoints[0].x;
  const dy = linePoints[linePoints.length - 1].y - linePoints[0].y;
  return Math.atan2(dy, dx) + Math.PI;
}

function lineFromAngle(x0, y0, radians) {
  const x1 = Math.round(x0 + (properties.localWidth * Math.cos(radians)));
  const y1 = Math.round(y0 + (properties.localHeight * Math.sin(radians)));
  const line = tileLine(x0, y0, x1, y1);
  return line;
}

function edgeTileFromAngle(x0, y0, radians) {
  const x1 = Math.round(x0 + (properties.localWidth * Math.cos(radians)));
  const y1 = Math.round(y0 + (properties.localHeight * Math.sin(radians)));
  const ray = tileRay(x0, y0, x1, y1);
  const edgeTile = ray.pop();
  return edgeTile;
}

function tileLine(x0, y0, x1, y1) {
  const linePoints = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = (x0 < x1) ? 1 : -1;
  const sy = (y0 < y1) ? 1 : -1;

  let x = x0;
  let y = y0;
  let err = dx - dy;

  linePoints.push({ x, y });
  while((x !== x1) || (y !== y1)) {
    //console.log(`${x}-${y}`);
    const err2 = 2 * err;
    if (err2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (err2 < dx) {
      err += dx;
      y += sy;
    }
    linePoints.push({ x, y });
  }

  return linePoints;
}

function tileRay(x0, y0, x1, y1) {
  const linePoints = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = (x0 < x1) ? 1 : -1;
  const sy = (y0 < y1) ? 1 : -1;

  let x = x0;
  let y = y0;
  let err = dx - dy;

  linePoints.push({ x, y });
  while(
    ((x !== 0) && (x !== properties.localWidth - 1)) &&
    ((y !== 0) && (y !== properties.localHeight - 1))) {
    const err2 = 2 * err;
    if (err2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (err2 < dx) {
      err += dx;
      y += sy;
    }
    linePoints.push({ x, y });
  }

  return linePoints;
}

function tileEllipse(xCenter, yCenter, xAxis, yAxis) {
  const points = {};
  const xBound = Math.round(xAxis);
  const yBound = Math.round(yAxis);
  for (let y = -yBound; y <= yBound; y++) {
    for (let x = -xBound; x <= xBound; x++) {
      const row = Math.round(
        (yAxis / xAxis) *
        Math.sqrt(Math.pow(xAxis, 2) - Math.pow(x, 2)));

      // console.log(`${x}, ${y}: row: +/- ${row}`);
      if (y <= row && y >= -row) {
        const mapX = Math.round(xCenter + x);
        const mapY = Math.round(yCenter + y);
        points[utils.keyFromXY(mapX, mapY)] = true;
      }
    }
  }
  return points;
}

function tileCircle(xCenter, yCenter, radius) {
  return tileEllipse(xCenter, yCenter, radius, radius);
}

function distance(x0, y0, x1, y1) {
  return Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
}

export default {
  rotateVector,
  octantOfLine,
  angleOfLine,
  lineFromAngle,
  edgeTileFromAngle,
  tileLine,
  tileRay,
  tileEllipse,
  tileCircle,
  distance
};
