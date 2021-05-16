import path from 'path';
import fs from 'fs';

import { MethodNotImplemented } from '../errors.js';
// import { translate as translatePoint,
//   scale as scalePoint, rotate as rotatePoint } from './util.js';
// TODO: delegate these to a transformer class (can be here) to avoid circular dependencies

export class Item {

  get vertices() { throw new MethodNotImplemented('vertices', this); }
  get faces() { throw new MethodNotImplemented('faces', this); }
  get edges() { throw new MethodNotImplemented('edges', this); }

  project(camera, screen, volume, projection, label) { throw new MethodNotImplemented('project', this); }
  // pointsToTransform() { throw new MethodNotImplemented('pointsToTransform', this); }

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


class Element2D {
  label;
}

export class Point2D extends Element2D {
  x; y;
}

export class Segment2D extends Element2D {
  p1; p2;
}

export class Polygon2D extends Element2D {
  points;
}

export class Ellipse2D extends Element2D {
  c; rx; ry; rot;
}