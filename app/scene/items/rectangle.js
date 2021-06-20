import { Square } from './square.js';

import log from 'loglevel';

export class Rectangle extends Square {
  /**
   * Square type definition
   * @property {Point} A, B, C, D
   */
   A; B; C; D;

   constructor(A, B, C) {
    super(4, new Plane(A, A.vectorTo(B).cross(A.vectorTo(C))));

    this.A = A; this.B = B; this.C = C;
    this.D = A.add(B.vectorTo(C));
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
    return Object.assign(new Polygon2D(
      [this.A, this.B, this.C, this.D].map(v => projection.projectPoint(v, projectionData))), {
      label
    });
   }
}