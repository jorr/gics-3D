import { Item, EPSILON } from './item.js';
import { Point } from './items/point.js';
import { Segment } from './items/segment.js';
import { Line } from './items/line.js';
import { Plane } from './items/plane.js';
import { Point2D, Segment2D } from './item.js';
import { Vector } from './vectors.js';
import { WrongParamsError, ImpossibleOperationError } from '../errors.js';

import log from 'loglevel';
import _ from 'lodash';
import util from 'util';

//arg2 is always the vaster object
export function dist(arg1, arg2) {
  if (arg1 instanceof Point && arg2 instanceof Point) {
    return Math.sqrt(
      (arg2.x - arg1.x)**2 +
      (arg2.y - arg1.y)**2 +
      (arg2.z - arg1.z)**2
    );
  } else if (arg1 instanceof Point && arg2 instanceof Plane) {
    return arg2.n.unit().dot(arg2.pt.vectorTo(arg1));
  } else if (arg1 instanceof Point && arg2 instanceof Line) {
    return dist(arg1, arg2.pt.add(arg2.u.unit().scale(arg2.u.unit().dot(arg2.pt.vectorTo(arg1)))));
  } else if (arg1 instanceof Line && arg2 instanceof Line) {
    return Math.abs(arg1.u.cross(arg2.u).unit().dot(arg1.pt.vectorTo(arg2.pt)));
  } else if (arg1 instanceof Line && arg2 instanceof Plane) {
    return dist(arg1.getPointAtParam(0), arg2);
  }
}

export function angle(arg1, arg2) {
  // turn segments to vectors
  if (arg1 instanceof Segment) arg1 = arg1.p1.vectorTo(arg1.p2);
  if (arg2 instanceof Segment) arg2 = arg2.p1.vectorTo(arg2.p2);
  // turn lines to vectors
  if (arg1 instanceof Line) arg1 = arg1.u;
  if (arg2 instanceof Line) arg2 = arg2.u;

  if (arg1 instanceof Vector && arg2 instanceof Vector)
    return Math.acos(arg1.unit().dot(arg2.unit()));
  else if (arg1 instanceof Vector && arg2 instanceof Plane)
    return Math.asin(arg1.unit().dot(arg2.n.unit()));
  else if (arg1 instanceof Plane && arg2 instanceof Plane)
    return angle(arg1.n, arg2.n);
}

export function midpoint(p1, p2) {
  return new Point(
    (p1.x + p2.x) / 2,
    (p1.y + p2.y) / 2,
    (p1.z + p2.z) / 2
  );
}

export function centroid(vertices) {
  let sum = vertices.reduce((totalValue, currentValue) => totalValue.add(currentValue.rvector), new Vector(0,0,0));
  return sum.scale(1/vertices.length).toPoint();
}


//sorts vertices to form convex polygon in the given plane
export function sortVertices(vertices, plane) {
  //TODO: switch to signed areas
  let sorted = [vertices.pop()], last = sorted[0];
  while (vertices.length) {
    let [newlast] = _.remove(vertices,
      v => vertices.every(w => v.equals(w) || last.vectorTo(v).triple(last.vectorTo(w), plane.n) > 0));
    if (!newlast) throw new ImpossibleOperationError('Attempting to sort vertices that don\'t form a convex polygon');
    sorted.push(newlast);
    last = newlast;
  }

  return sorted;
}

export function convexHull(vertices, plane) {
  let hull = [vertices.pop()], last = hull[0];
  do {
    let [newlast] = vertices.splice(
      vertices.findIndex(v => vertices.every(w => w.equals(v) || orientation(last,v,w,plane.n) > 0)),
      1);
    if (!newlast) throw new ImpossibleOperationError('Cannot construct convex hull of vertices');
    hull.push(newlast);
    last = newlast;
    if (last.equals(hull[0])) break;
  } while (vertices.length);

  return hull;
}

export function pointInVolume(p, v) {
  return Math.abs(p.x) - v.w/2 <= EPSILON  &&
    Math.abs(p.y) - v.h/2 <= EPSILON &&
    p.z >= 0 && Math.abs(p.z) - v.d <= EPSILON;
}

export function orientation(p1, p2, p3, n) {
  return p1.vectorTo(p2).triple(p1.vectorTo(p3), n);
}

export function pointInTriangle(p, p1, p2, p3) {
  let n = p1.vectorTo(p2).cross(p1.vectorTo(p3));
  let o = [orientation(p,p1,p2,n), orientation(p,p2,p3,n), orientation(p,p3,p1,n)];
  return o.every(o => o >= 0) || o.every(o => o <= 0);
}

export function pointInPolygon(p, vertices) {
  let v = vertices[0], n = vertices.length;
  for (let i = 2 ; i < n ; i++) {
    if (pointInTriangle(p,v,vertices[i-1],vertices[i])) return true;
  }
  return false;
}