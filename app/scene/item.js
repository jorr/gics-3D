import path from 'path';
import fs from 'fs';
import log from 'loglevel';

import { MethodNotImplemented } from '../errors.js';
// import { translate as translatePoint,
//   scale as scalePoint, rotate as rotatePoint } from './util.js';
// TODO: delegate these to a transformer class (can be here) to avoid circular dependencies

export class Item {

  suppressed = false;

  //TODO: implement
  get vertices() { throw new MethodNotImplemented('vertices', this); }
  get faces() { throw new MethodNotImplemented('faces', this); }
  get edges() { throw new MethodNotImplemented('edges', this); }

  project(projectionData, projection, label) { throw new MethodNotImplemented('project', this); }
  // pointsToTransform() { throw new MethodNotImplemented('pointsToTransform', this); }

  // TODO: delegate transform to descendants
  // transform(transformation, data) {
  //   for (let p of this.pointsToTransform()) {
  //     transformation(p, ...data);
  //   }
  // }

  // // transformations
  // translate(v) { this.transform(translatePoint, [v]); }
  // scale(n) { this.transform(scalePoint, [n]); }
  // rotate(axis, fi) { this.transform(rotatePoint, [axis, fi]); }
};

export class Polygon extends Item {
  plane; n; // number of vertices

  constructor(n, plane) {
    super();
    this.n = n;
    this.plane = plane;
  }

  //TODO: getter AB es7 goodness
}

class Element2D {
  label;
  color;
}

export class Point2D extends Element2D {
  x; y;
  constructor(x,y) { super(); this.x = x; this.y = y; }

  equals(p) {
    return this.x === p.x && this.y === p.y;
  }
}

export class Segment2D extends Element2D {
  p1; p2;
  constructor(p1, p2) { super(); this.p1 = p1; this.p2 = p2; }

  get len() {
    return Math.sqrt((this.p2.x-this.p1.x)**2 + (this.p2.y-this.p1.y)**2);
  }
}

export class Polygon2D extends Element2D {
  points;

  constructor(points) { super(); this.points = points; }

  get centre() {
    let sum = this.points.reduce((totalValue, currentValue) => ({x: totalValue.x+currentValue.x, y:totalValue.y+currentValue.y}), {x: 0, y:0});
    return new Point2D(sum.x/this.points.length, sum.y/this.points.length);
  }
}

export class Ellipse2D extends Element2D {
  c; rx; ry; rotate;
  constructor(c,rx,ry,rotate) { super(); this.c = c; this.rx = rx; this.ry = ry; this.rotate = rotate; }
}