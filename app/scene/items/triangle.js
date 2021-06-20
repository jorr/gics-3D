import { Polygon, Polygon2D } from '../item.js';
import { Plane } from './plane.js';
import { Segment } from './segment.js';

import log from 'loglevel';

export class Triangle extends Polygon {
  /**
   * Square type definition
   * @property {Point} A, B, C
   */
   A; B; C;

   constructor(A, B, C) {
    let n = A.vectorTo(B).cross(A.vectorTo(C)).unit();
    if (n.y < 0) n = n.scale(-1); //TODO: check rhs vs lhs in a smarter way
    super(3, new Plane(A, n));

    this.A = A; this.B = B; this.C = C;
   }

   //getters for centers

  pointsToTransform() {
    return [this.A, this.B, this.C];
  }

  get vertices() {
    return [this.A, this.B, this.C];
  }

  get a() {
    return new Segment(this.B, this.C);
  }

  get b() {
    return new Segment(this.A, this.C);
  }

  get c() {
    return new Segment(this.A, this.B);
  }

  //TODO: this can be implenented at Polygon with this.vertices
  project(projectionData, projection, label) {
    return Object.assign(new Polygon2D(
      this.vertices.map(v => projection.projectPoint(v, projectionData))),
      { label }
    );
  }
}