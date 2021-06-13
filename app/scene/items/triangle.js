import { Item, Polygon2D } from '../item.js';
import { Plane } from './plane.js';

import log from 'loglevel';

export class Triangle extends Item {
  /**
   * Square type definition
   * @property {Point} A, B, C
   */
   A; B; C;
   plane;

   constructor(A, B, C) {
    super();

    this.A = A; this.B = B; this.C = C;
    let n = A.vectorTo(B).cross(A.vectorTo(C)).unit();
    if (n.y < 0) n = n.scale(-1); //TODO: check rhs vs lhs in a smarter way
    this.plane = new Plane(A, n);
   }

   //getters for centers

   pointsToTransform() {
    return [this.A, this.B, this.C];
  }

  get vertices() {
    return [this.A, this.B, this.C];
   }

   project(projectionData, projection, label) {
    return Object.assign(new Polygon2D, {
      points: this.vertices.map(v => projection.projectPoint(v, projectionData)),
      label
    });
   }
}