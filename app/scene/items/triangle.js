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

    log.debug(A,B,C)
    this.A = A; this.B = B; this.C = C;
    this.plane = new Plane(A, A.vectorTo(B).cross(A.vectorTo(C)));
   }

   //getters for centers

   pointsToTransform() {
    return [this.A, this.B, this.C];
  }

   project(projectionData, projection, label) {
    return Object.assign(new Polygon2D, {
      points: [this.A, this.B, this.C].map(v => projection.projectPoint(v, projectionData)),
      label
    });
   }
}