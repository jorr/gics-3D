import { Point } from './items/point.js';
import { Segment } from './items/segment.js';
import { Line } from './items/line.js';
import { Plane } from './items/plane.js';
import { Point2D, Segment2D } from './item.js';
import { Vector2D } from './vectors.js';
import { WrongParamsError } from '../errors.js';

import log from 'loglevel';

// CALCULATIONS

export function dist2D(arg1, arg2) {
  if (arg1 instanceof Point2D && arg2 instanceof Point2D) {
    return Math.sqrt((arg2.x - arg1.x)**2 + (arg2.y - arg1.y)**2);
  }
}

export function angle2D(v1, v2) {
  v1 = v1.unit(); v2 = v2.unit();
  return Math.acos(v1.dot(v2)) * 180 / Math.PI;
}

export function translateWith(p, v) {
  return new Point2D(p.x+v.x, p.y+v.y);
}

export function ellipseConvertConjugateDiametersToAxes(cen, diam1, diam2, mainAxisProjectionOut = null) {
  // this implements https://math.stackexchange.com/a/2412079

  let auxLine = Vector2D.fromPoints(diam2.p1, diam2.p2).perpendicular().unit().scale(diam2.len/2);
  let aux1 = translateWith(diam1.p2, auxLine), aux2 = translateWith(diam1.p2, auxLine.scale(-1));
  let cenAux1 = Vector2D.fromPoints(cen, aux1), cenAux2 = Vector2D.fromPoints(cen, aux2);

  let mainAxisProjection = cenAux1.unit().add(cenAux2.unit()).unit(),
  rx = (cenAux1.norm + cenAux2.norm)/2, ry = Math.abs(cenAux1.norm - cenAux2.norm)/2;

  // we use this as an out parameter, in order to pass up the angle between the main axis in the projection and in the original plane
  if (mainAxisProjectionOut) {
    mainAxisProjectionOut.p1 = translateWith(cen, mainAxisProjection.scale(rx));
    mainAxisProjectionOut.p2 = translateWith(cen, mainAxisProjection.scale(-rx));
  }

  // cenAux1.add(cenAux2) is the bisector betwee cenAux1 and cenAux2

  return {
    rx,
    ry,
    rotate: rx === ry ? 0 : angle2D( // the angle between a radius of the ellipse and Ox in 2D
      new Vector2D(1,0),
      mainAxisProjection
    )
  };
}