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

// CALCULATIONS

//arg2 is always the vaster object
export function dist(arg1, arg2) {
  if (arg1 instanceof Point && arg2 instanceof Point) {
    return Math.sqrt(
      (arg2.x - arg1.x)**2 +
      (arg2.y - arg1.y)**2 +
      (arg2.z - arg1.z)**2
    );
  } else if (arg1 instanceof Point && arg2 instanceof Plane) {
    return arg2.n.unit().dot(arg2.pt.vectorTo(arg1)).norm();
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

// CONSTRUCTS

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
  // let centre = centroid(vertices); //TODO: check that all vertices and the centroid lie on the same plane
  // let axis = plane.getCoplanarVector().unit();
  // return vertices.sort((a,b) => {
  //   return ((angle(centre.vectorTo(a), axis) - angle(centre.vectorTo(b), axis)) * Math.PI/180 + 360) % 360;
  // });

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

export function shrinkPolygon(polygon, factor) {
  let centre = centroid(polygon.vertices);
  return new polygon.constructor(...polygon.vertices.map(v => v.add(v.vectorTo(centre).scale(factor))));
}

// CHECKS

// export const EPSILON = 0.001;

export function pointInVolume(p, v) {
  return Math.abs(p.x) - v.w/2 <= Number.EPSILON  &&
    Math.abs(p.y) - v.h/2 <= Number.EPSILON &&
    p.z >= 0 && Math.abs(p.z) - v.d <= Number.EPSILON;
}

// TRANSFORMATIONS

export function translate(p, v) {
  return p.add(v);
}

export function rotate(p, axis, fi) {
  const u = axis.u.unit(), a = axis.pt.rvector, ap = a.vectorTo(p);
  return new Point(a.add(u.scale((1 - Math.cos(fi))*u.dot(ap))).
                add(ap.scale(Math.cos(fi))).
                add(u.cross(ap).scale(Math.sin(fi))));
}

export function scale(p, n) {
  return new Point(p.rvector.scale(n));
}