import { Item, Polygon2D } from '../item.js';
import { Plane } from './plane.js';

import log from 'loglevel';

export class Square extends Item {
  /**
   * Square type definition
   * @property {Point} A, B, C, D
   */
   A; B; C; D;
   plane;

   constructor(A, B, C) {
    super();

    this.A = A; this.B = B; this.C = C;
    this.D = A.add(B.vectorTo(C));
    this.plane = new Plane(A, A.vectorTo(B).cross(A.vectorTo(C)));
   }

   get side() {
    return this.A.vectorTo(this.B).norm;
   }

   get vertices() {
    return [this.A, this.B, this.C, this.D];
   }

   pointsToTransform() {
    return [this.A, this.B, this.C, this.D];
  }

   project(projectionData, projection, label) {
    return Object.assign(new Polygon2D, {
      points: [this.A, this.B, this.C, this.D].map(v => projection.projectPoint(v, projectionData)),
      label
    });
   }
}